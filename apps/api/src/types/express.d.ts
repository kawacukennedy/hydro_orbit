import express from 'express';
import { SimulationEngine } from '../simulation.js';

declare global {
  namespace Express {
    interface Request {
      timezone?: string;
      simulationEngine?: SimulationEngine | null;
    }
  }
}
