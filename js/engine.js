/**
 * JolWatch Edge - Core Detection & Analytics Engine
 * Author: Shawon Khan
 *
 * Implements deterministic flow-balance analysis, reserve projection,
 * and tank health assessment. Compatible with both Browser and Node.js.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.JolWatchEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Classify flow anomalies based on inlet-to-zone balance, tank level, and duration.
   *
   * @param {Object} input
   * @param {number} input.inlet - Main inlet flow rate (L/min)
   * @param {number} input.level - Tank level percentage (0-100)
   * @param {number[]} input.zones - Array of zone flow readings (L/min)
   * @param {number} input.duration - Duration of current flow pattern (minutes)
   * @returns {Object} classification result
   */
  function classifyDetection({ inlet = 0, level = 0, zones = [], duration = 0 }) {
    const zoneTotal = zones.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const gap = Math.max(0, inlet - zoneTotal);
    const gapPercent = inlet > 0 ? (gap / inlet) * 100 : 0;
    const zoneOverread = zoneTotal - inlet;

    // Rule 1: Physical impossibility - zones exceed inlet by tolerance (>2 L/min)
    if (zoneOverread > 2) {
      return {
        type: 'Sensor mismatch',
        severity: 'warn',
        title: 'Readings are inconsistent',
        description: 'Zone total exceeds the inlet. Verify sensor placement, timing, and calibration before taking action.',
        inlet,
        zones: zoneTotal,
        gap,
        gapPercent,
        level,
        duration
      };
    }

    // Rule 2: Tank is nearly full (>=95%) while inlet continues without matching zone draw
    if (level >= 95 && inlet > 10 && gapPercent > 25) {
      return {
        type: 'Possible tank overflow',
        severity: 'danger',
        title: 'Possible overflow or float-valve failure',
        description: 'Tank is nearly full while a large inlet-to-zone gap continues. Inspect the tank shutoff and float valve.',
        inlet,
        zones: zoneTotal,
        gap,
        gapPercent,
        level,
        duration
      };
    }

    // Rule 3: Persistent unexplained loss (>15% gap lasting at least 15 minutes)
    if (gapPercent > 15 && duration >= 15) {
      return {
        type: 'Possible hidden leak',
        severity: 'danger',
        title: 'Persistent unexplained flow detected',
        description: 'Inlet-to-zone balance gap exceeds 15% for over 15 minutes. Inspect unmonitored branch pipes, cisterns, and fixtures.',
        inlet,
        zones: zoneTotal,
        gap,
        gapPercent,
        level,
        duration
      };
    }

    // Rule 4: Moderate imbalance requiring operator observation
    if (gapPercent > 8) {
      return {
        type: 'Monitor',
        severity: 'warn',
        title: 'Flow imbalance needs monitoring',
        description: 'The balance gap is elevated but has not yet met the critical persistence duration threshold.',
        inlet,
        zones: zoneTotal,
        gap,
        gapPercent,
        level,
        duration
      };
    }

    // Rule 5: Normal balanced operation
    return {
      type: 'Normal',
      severity: 'normal',
      title: 'Flow balance is within tolerance',
      description: 'Unexplained flow is below the action threshold.',
      inlet,
      zones: zoneTotal,
      gap,
      gapPercent,
      level,
      duration
    };
  }

  /**
   * Estimate available hours of essential water remaining.
   *
   * @param {Object} params
   * @param {number} params.capacity - Tank capacity in Litres
   * @param {number} params.level - Current tank level percentage (0-100)
   * @param {number} params.gap - Current unexplained loss rate (L/min)
   * @param {string} params.profile - Facility profile ('school' | 'clinic')
   * @returns {Object} hours and reserve breakdown
   */
  function calculateReserve({ capacity = 5000, level = 50, gap = 0, profile = 'school' }) {
    const isClinic = profile === 'clinic';
    const demandPerHour = isClinic ? 180 : 120;
    const reserveFraction = isClinic ? 0.30 : 0.20;

    const currentLitres = capacity * (Math.min(100, Math.max(0, level)) / 100);
    const protectedReserveLitres = capacity * reserveFraction;
    const usableLitres = Math.max(0, currentLitres - protectedReserveLitres);

    const lossBurdenPerHour = gap * 60;
    const totalHourlyBurn = Math.max(1, demandPerHour + lossBurdenPerHour);
    const hoursRemaining = usableLitres / totalHourlyBurn;
    const percentOf24h = Math.min(100, (hoursRemaining / 24) * 100);

    return {
      hoursRemaining: Number(hoursRemaining.toFixed(1)),
      percentOf24h: Math.round(percentOf24h),
      usableLitres: Math.round(usableLitres),
      demandPerHour,
      lossBurdenPerHour: Math.round(lossBurdenPerHour)
    };
  }

  /**
   * Assess tank water quality signals and recommend inspection/cleaning interval.
   *
   * @param {Object} observations
   * @param {number} observations.turbidity - Turbidity in NTU
   * @param {number} observations.tds - Current Total Dissolved Solids in ppm
   * @param {number} observations.tdsBase - Usual TDS baseline in ppm
   * @param {number} observations.temp - Water temperature in Celsius
   * @param {number} observations.days - Days elapsed since last physical inspection
   * @param {number} observations.turnover - Tank turnover frequency per week
   * @returns {Object} health score and advisories
   */
  function assessTankHealth({
    turbidity = 1.0,
    tds = 200,
    tdsBase = 200,
    temp = 25,
    days = 30,
    turnover = 3
  }) {
    let penalty = 0;
    const reasons = [];

    if (turbidity > 5) {
      penalty += 30;
      reasons.push('Turbidity elevated above 5 NTU');
    } else if (turbidity > 1.5) {
      penalty += 10;
      reasons.push('Visible clarity degradation trend');
    }

    const baseline = Math.max(1, tdsBase);
    const tdsVariance = Math.abs(tds - baseline) / baseline;
    if (tdsVariance > 0.25) {
      penalty += 20;
      reasons.push('TDS deviation >25% from established baseline');
    }

    if (temp > 30) {
      penalty += 10;
      reasons.push('Elevated water temperature (>30°C)');
    }

    if (days > 90) {
      penalty += 25;
      reasons.push('Physical inspection overdue (>90 days)');
    } else if (days > 45) {
      penalty += 10;
      reasons.push('Inspection interval approaching review (>45 days)');
    }

    if (turnover < 1) {
      penalty += 15;
      reasons.push('Low tank turnover rate (stagnation risk)');
    }

    const score = Math.max(0, 100 - penalty);
    let title = 'Routine monitoring';
    if (score < 60) {
      title = 'Inspect and plan cleaning soon';
    } else if (score < 80) {
      title = 'Schedule tank inspection';
    }

    return {
      score,
      title,
      reasons,
      summary: reasons.length
        ? 'Key signals: ' + reasons.join('; ') + '. Always confirm with proper physical inspection.'
        : 'All measured observation signals are within typical operating ranges.'
    };
  }

  return {
    classifyDetection,
    calculateReserve,
    assessTankHealth
  };
});
