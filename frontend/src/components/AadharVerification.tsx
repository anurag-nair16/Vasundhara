import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Loader2, Smartphone, Lock } from 'lucide-react';

interface AadharVerificationProps {
    onVerified: () => void;
    onSkip?: () => void;
}

type Step = 'aadhar' | 'sending' | 'otp' | 'verifying' | 'success';

const AadharVerification = ({ onVerified, onSkip }: AadharVerificationProps) => {
    const [step, setStep] = useState<Step>('aadhar');
    const [aadharNumber, setAadharNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [maskedPhone, setMaskedPhone] = useState('');
    const [error, setError] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Format Aadhar number with spaces (XXXX XXXX XXXX)
    const formatAadhar = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 12);
        const parts = [];
        for (let i = 0; i < digits.length; i += 4) {
            parts.push(digits.slice(i, i + 4));
        }
        return parts.join(' ');
    };

    const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatAadhar(e.target.value);
        setAadharNumber(formatted);
        setError('');
    };

    const validateAadhar = () => {
        const digits = aadharNumber.replace(/\s/g, '');
        if (digits.length !== 12) {
            setError('Please enter a valid 12-digit Aadhar number');
            return false;
        }
        return true;
    };

    const handleSendOtp = async () => {
        if (!validateAadhar()) return;

        setStep('sending');

        // Simulate sending OTP
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Generate masked phone number
        const last4 = Math.floor(1000 + Math.random() * 9000);
        setMaskedPhone(`XXXXXXXX${last4}`);

        setStep('otp');

        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setStep('verifying');

        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        setStep('success');

        // Redirect after success animation
        setTimeout(() => {
            onVerified();
        }, 1500);
    };

    const handleResendOtp = async () => {
        setOtp(['', '', '', '', '', '']);
        setStep('sending');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 gradient-card border-border/50 shadow-eco overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <motion.div
                            className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl mb-4 shadow-lg"
                            animate={{
                                boxShadow: step === 'success'
                                    ? '0 0 30px rgba(34, 197, 94, 0.5)'
                                    : '0 0 20px rgba(249, 115, 22, 0.3)'
                            }}
                        >
                            {step === 'success' ? (
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            ) : (
                                <Shield className="h-12 w-12 text-white" />
                            )}
                        </motion.div>
                        <h1 className="text-2xl font-bold text-foreground">Aadhar Verification</h1>
                        <p className="text-muted-foreground text-center mt-2">
                            {step === 'success'
                                ? 'Your identity has been verified!'
                                : 'Verify your identity using Aadhar'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Aadhar Input */}
                        {step === 'aadhar' && (
                            <motion.div
                                key="aadhar"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="aadhar" className="text-foreground font-medium">
                                        Aadhar Card Number
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="aadhar"
                                            type="text"
                                            placeholder="XXXX XXXX XXXX"
                                            className="pl-12 text-lg tracking-widest font-mono h-14 text-center"
                                            value={aadharNumber}
                                            onChange={handleAadharChange}
                                            maxLength={14}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-destructive">{error}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Your Aadhar number is securely encrypted
                                    </p>
                                </div>

                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg"
                                    onClick={handleSendOtp}
                                >
                                    Send OTP
                                </Button>

                                {onSkip && (
                                    <Button
                                        variant="ghost"
                                        className="w-full text-muted-foreground"
                                        onClick={onSkip}
                                    >
                                        Skip for now
                                    </Button>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Sending OTP Animation */}
                        {step === 'sending' && (
                            <motion.div
                                key="sending"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-8 space-y-6"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="h-16 w-16 text-orange-500" />
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium text-foreground">Sending OTP...</p>
                                    <p className="text-sm text-muted-foreground">
                                        Please wait while we send OTP to your<br />
                                        Aadhar-linked mobile number
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: OTP Input */}
                        {step === 'otp' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <Smartphone className="h-5 w-5 text-green-500" />
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                        OTP sent to {maskedPhone}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-foreground font-medium text-center block">
                                        Enter 6-digit OTP
                                    </Label>
                                    <div className="flex justify-center gap-2">
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                ref={(el) => (otpRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                className="w-12 h-14 text-center text-xl font-bold"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                maxLength={1}
                                            />
                                        ))}
                                    </div>
                                    {error && (
                                        <p className="text-sm text-destructive text-center">{error}</p>
                                    )}
                                </div>

                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg"
                                    onClick={handleVerifyOtp}
                                >
                                    Verify OTP
                                </Button>

                                <div className="text-center">
                                    <button
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                        onClick={handleResendOtp}
                                    >
                                        Didn't receive OTP? <span className="text-orange-500 font-medium">Resend</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Verifying Animation */}
                        {step === 'verifying' && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-8 space-y-6"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="h-16 w-16 text-orange-500" />
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <p className="text-lg font-medium text-foreground">Verifying OTP...</p>
                                    <p className="text-sm text-muted-foreground">
                                        Please wait while we verify your identity
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-8 space-y-6"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center"
                                >
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <p className="text-xl font-bold text-green-500">Verification Successful!</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your Aadhar has been verified successfully.<br />
                                        Redirecting to dashboard...
                                    </p>
                                </div>
                                <motion.div
                                    className="w-full h-1 bg-muted rounded-full overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className="h-full bg-green-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 1.5 }}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* UIDAI Footer */}
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <div className="flex items-center justify-center gap-2 opacity-60">
                            <img
                                src="https://uidai.gov.in/images/logo/aadhaar_english_logo.svg"
                                alt="UIDAI"
                                className="h-6"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="text-xs text-muted-foreground">Powered by UIDAI</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default AadharVerification;
