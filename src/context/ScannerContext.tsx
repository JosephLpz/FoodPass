'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { validateAndRegisterQR } from '@/lib/api/services';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { QRValidationResult } from '@/types';

interface ScannerContextType {
    currentDiningHallId: string | null;
    setDiningHallId: (id: string | null) => void;
    isEnhanced: boolean;
    setIsEnhanced: (value: boolean) => void;
    simulateScan: (text: string) => void;
    lastResult: QRValidationResult | null;
    isProcessing: boolean;
    setInterceptCallback: (callback: ((text: string) => boolean) | null) => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

const SCANNER_TIMEOUT = 50; // ms between keys to consider it a scanner

export function ScannerProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [currentDiningHallId, setCurrentDiningHallId] = useState<string | null>(null);
    const [isEnhanced, setIsEnhanced] = useState(false);
    const [lastResult, setLastResult] = useState<QRValidationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const interceptRef = useRef<((text: string) => boolean) | null>(null);
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    // Load dining hall from localStorage on mount
    useEffect(() => {
        const savedHall = localStorage.getItem('foodpass_dining_hall_id');
        if (savedHall) setCurrentDiningHallId(savedHall);
    }, []);

    const setDiningHallId = (id: string | null) => {
        setCurrentDiningHallId(id);
        if (id) {
            localStorage.setItem('foodpass_dining_hall_id', id);
        } else {
            localStorage.removeItem('foodpass_dining_hall_id');
        }
    };

    const setInterceptCallback = useCallback((callback: ((text: string) => boolean) | null) => {
        interceptRef.current = callback;
    }, []);

    const processScan = useCallback(async (text: string) => {
        if (isProcessing) return;

        console.log('Processing scan:', text);

        // 0. Check for interceptor ref
        if (interceptRef.current) {
            try {
                const consumed = interceptRef.current(text);
                if (consumed) {
                    console.log('Scan consumed by interceptor');
                    return;
                }
            } catch (err) {
                console.error('Error in scanner interceptor:', err);
                // Continue with normal processing if interceptor fails
            }
        }

        setIsProcessing(true);
        setLastResult(null);

        let rutToUse = text.trim();

        // 1. Check if it's a URL from Registro Civil
        if (rutToUse.includes('registrocivil.cl') || rutToUse.includes('document-validity')) {
            try {
                // Multi-parameter regex for RUN
                const urlMatch = rutToUse.match(/[?&]RUN=([^&]+)/);
                if (urlMatch && urlMatch[1]) {
                    rutToUse = urlMatch[1];
                } else if (rutToUse.includes('?')) {
                    const url = new URL(rutToUse);
                    rutToUse = url.searchParams.get('RUN') || rutToUse;
                }
            } catch (e) {
                console.error('Error parsing scanner URL:', e);
            }
        }

        // 2. Validate we have a dining hall
        if (!currentDiningHallId) {
            toast.error('Debe seleccionar un comedor antes de escanear', {
                description: 'Configure el comedor en la pantalla de Registro QR'
            });
            setIsProcessing(false);
            return;
        }

        // 3. Trigger registration
        try {
            const response = await validateAndRegisterQR(rutToUse, isEnhanced, currentDiningHallId, user?.id);

            if (response.success && response.data) {
                setLastResult(response.data);
                if (response.data.success) {
                    toast.success(`¡Registrado! ${response.data.person?.name}`, {
                        description: `${response.data.mealType?.toUpperCase()} ${response.data.isEnhanced ? '(MEJORADO)' : ''}`
                    });
                } else if (response.data.alreadyRegistered) {
                    toast.warning('Ya registrado', {
                        description: `${response.data.person?.name} ya registró su ${response.data.mealType}`
                    });
                } else {
                    toast.error(response.data.error || 'Error al validar');
                }
            } else {
                toast.error(response.error || 'Error de conexión');
            }
        } catch (error) {
            toast.error('Error procesando scan');
        } finally {
            setIsProcessing(false);
        }
    }, [currentDiningHallId, isEnhanced, user, isProcessing]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Scanner keyboard emulation logic
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;
            lastKeyTime.current = currentTime;

            if (e.key.length === 1) {
                if (timeDiff > SCANNER_TIMEOUT) {
                    buffer.current = e.key;
                } else {
                    buffer.current += e.key;
                }
            } else if (e.key === 'Enter') {
                if (buffer.current.length > 5) {
                    processScan(buffer.current);
                }
                buffer.current = '';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [processScan]);

    const simulateScan = (text: string) => {
        processScan(text);
    };

    return (
        <ScannerContext.Provider
            value={{
                currentDiningHallId,
                setDiningHallId,
                isEnhanced,
                setIsEnhanced,
                simulateScan,
                lastResult,
                isProcessing,
                setInterceptCallback
            }}
        >
            {children}
        </ScannerContext.Provider>
    );
}

export function useScanner() {
    const context = useContext(ScannerContext);
    if (context === undefined) {
        throw new Error('useScanner must be used within a ScannerProvider');
    }
    return context;
}
