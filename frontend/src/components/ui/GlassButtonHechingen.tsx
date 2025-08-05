import React from 'react';
import { GlassButton, GlassButtonProps } from './GlassButton';

// Hechingen-specific button variants
export const GlassButtonHechingen: React.FC<Omit<GlassButtonProps, 'variant'>> = (props) => (
  <GlassButton {...props} variant="hechingen-primary" />
);

export const GlassButtonHechingenSuccess: React.FC<Omit<GlassButtonProps, 'variant'>> = (props) => (
  <GlassButton {...props} variant="hechingen-success" />
);

export const GlassButtonHechingenHeritage: React.FC<Omit<GlassButtonProps, 'variant'>> = (props) => (
  <GlassButton {...props} variant="hechingen-heritage" />
);

// Utility variants
export const GlassButtonGhost: React.FC<Omit<GlassButtonProps, 'ghost'>> = (props) => (
  <GlassButton {...props} ghost={true} />
);

export const GlassButtonFullWidth: React.FC<Omit<GlassButtonProps, 'fullWidth'>> = (props) => (
  <GlassButton {...props} fullWidth={true} />
);

export const GlassButtonAnimated: React.FC<Omit<GlassButtonProps, 'animated'>> = (props) => (
  <GlassButton {...props} animated={true} />
);