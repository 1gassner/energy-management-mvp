import React from 'react';
import { cn } from '@/lib/utils';
import { ModernCard } from './ModernCard';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Crown,
  Award
} from 'lucide-react';

type AlertType = 'success' | 'warning' | 'error' | 'info' | 'achievement' | 'heritage';

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  children?: React.ReactNode;
  variant?: 'default' | 'glassmorphism' | 'education' | 'pool' | 'sports' | 'heritage';
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  animate?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  children,
  variant = 'default',
  className = '',
  dismissible = false,
  onDismiss,
  animate = true
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          titleColor: 'text-green-800 dark:text-green-200',
          textColor: 'text-green-700 dark:text-green-300'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          titleColor: 'text-yellow-800 dark:text-yellow-200',
          textColor: 'text-yellow-700 dark:text-yellow-300'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          titleColor: 'text-red-800 dark:text-red-200',
          textColor: 'text-red-700 dark:text-red-300'
        };
      case 'achievement':
        return {
          icon: <Award className="w-5 h-5" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          titleColor: 'text-emerald-800 dark:text-emerald-200',
          textColor: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'heritage':
        return {
          icon: <Crown className="w-5 h-5" />,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          titleColor: 'text-amber-800 dark:text-amber-200',
          textColor: 'text-amber-700 dark:text-amber-300'
        };
      default: // info
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          titleColor: 'text-blue-800 dark:text-blue-200',
          textColor: 'text-blue-700 dark:text-blue-300'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <ModernCard 
      variant={variant} 
      className={cn(
        'border-l-4',
        config.bgColor,
        config.borderColor,
        animate && 'animate-slide-in-right',
        className
      )}
      animate={animate}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn('flex-shrink-0 mr-3', config.iconColor)}>
            {config.icon}
          </div>
          
          <div className="flex-1">
            <h4 className={cn('font-semibold mb-2', config.titleColor)}>
              {title}
            </h4>
            <p className={cn('text-sm', config.textColor)}>
              {message}
            </p>
            
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
          
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                config.iconColor
              )}
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </ModernCard>
  );
};

export default AlertCard;