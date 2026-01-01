import { Service } from '../types';

export const SERVICES: Service[] = [
  { 
    id: 'swedish', 
    name: 'Swedish Massage', 
    duration: '60 min', 
    price: '$85', 
    icon: '🍃',
    description: 'A gentle full-body massage ideal for relaxation and stress management.',
    benefits: ['Stress reduction', 'Improved circulation', 'Muscle tension relief']
  },
  { 
    id: 'deeptissue', 
    name: 'Deep Tissue', 
    duration: '90 min', 
    price: '$120', 
    icon: '💪',
    description: 'Targeted pressure to reach deeper layers of muscle and connective tissue.',
    benefits: ['Chronic pain relief', 'Injury rehabilitation', 'Lowered blood pressure']
  },
  { 
    id: 'aromatherapy', 
    name: 'Aromatherapy', 
    duration: '60 min', 
    price: '$95', 
    icon: '🌸',
    description: 'Combines soft pressure with therapeutic essential oils for emotional well-being.',
    benefits: ['Boosts mood', 'Reduces anxiety', 'Improves sleep quality']
  },
  { 
    id: 'sports', 
    name: 'Sports Therapy', 
    duration: '75 min', 
    price: '$110', 
    icon: '🏃',
    description: 'Focused on preventing and treating injuries for active individuals.',
    benefits: ['Greater flexibility', 'Pre-event prep', 'Faster recovery']
  }
];