import { CheckCircle, GraduationCap } from 'lucide-react';

interface VerifiedBadgeProps {
    verified?: boolean;
    isStudent?: boolean;
    size?: 'sm' | 'md';
    showLabel?: boolean;
}

export function VerifiedBadge({ verified, isStudent, size = 'sm', showLabel = false }: VerifiedBadgeProps) {
    if (!verified) return null;

    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    return (
        <span className="inline-flex items-center gap-1" title={isStudent ? 'Verified Student' : 'Verified'}>
            <CheckCircle className={`${iconSize} text-green-500`} />
            {isStudent && <GraduationCap className={`${iconSize} text-blue-500`} />}
            {showLabel && <span className="text-xs text-green-600 font-medium">Verified</span>}
        </span>
    );
}
