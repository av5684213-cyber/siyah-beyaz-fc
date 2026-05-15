'use client';

import React from 'react';

export function ToastNotifications({ showTrainingToast, migrationResult, onDismissMigration }: any) {
  return null; // Simplified
}

export function showToast(msg: string, type: 'success' | 'error' = 'success') {
  console.log(`TOAST: [${type}] ${msg}`);
}
