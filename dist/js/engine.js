/**
 * JolWatch Edge - Core Detection & Analytics Engine
 * Author: Shawon Khan
 *
 * Implements deterministic flow-balance analysis, reserve projection,
 * and tank maintenance assessment. Compatible with Browser and Node.js.
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
  function classifyDetection({ inlet = 0, level = 0, zones = [], duration = 0 } = {}) {
    const cleanInlet = Math.max(0, Number(inlet) || 0);
    const cleanLevel = Math.min(100, Math.max(0, Number(level) || 0));
    const cleanDuration = Math.max(0, Number(duration) || 0);
    const cleanZones = Array.isArray(zones)
      ? zones.map((z) => Math.max(0, Number(z) || 0))
      : [];

    const zoneTotal = cleanZones.reduce((sum, val) => sum + val, 0);
    const gap = Math.max(0, cleanInlet - zoneTotal);
    const gapPercent = cleanInlet > 0 ? (gap / cleanInlet) * 100 : 0;
    const zoneOverread = zoneTotal - cleanInlet;

    // Rule 1: Physical impossibility - zones exceed inlet by tolerance (>2 L/min)
    if (zoneOverread > 2) {
      return {
        type: 'Sensor mismatch',
        severity: 'warn',
        title: 'Readings are inconsistent',
        description: 'Zone total exceeds the inlet. Verify sensor placement, timing, and calibration before taking action.',
        inlet: cleanInlet,
        zones: Number(zoneTotal.toFixed(2)),
        gap: Number(gap.toFixed(2)),
        gapPercent: Number(gapPercent.toFixed(2)),
        level: cleanLevel,
        duration: cleanDuration
      };
    }

    // Rule 2: Tank is nearly full (>=95%) while inlet > 10 L/min and loss rate > 25%
    if (cleanLevel >= 95 && cleanInlet > 10 && gapPercent > 25) {
      return {
        type: 'Possible tank overflow',
        severity: 'danger',
        title: 'Possible overflow or float-valve failure',
        description: 'Tank is nearly full while a large inlet-to-zone gap continues. Inspect the tank shutoff and float valve.',
        inlet: cleanInlet,
        zones: Number(zoneTotal.toFixed(2)),
        gap: Number(gap.toFixed(2)),
        gapPercent: Number(gapPercent.toFixed(2)),
        level: cleanLevel,
        duration: cleanDuration
      };
    }

    // Rule 3: Persistent unexplained loss (loss rate > 15% lasting at least 15 minutes)
    if (gapPercent > 15 && cleanDuration >= 15) {
      return {
        type: 'Possible hidden leak',
        severity: 'danger',
        title: 'Persistent unexplained flow detected',
        description: 'Inlet-to-zone balance gap exceeds 15% for at least 15 minutes. Inspect unmonitored branch pipes, cisterns, and fixtures.',
        inlet: cleanInlet,
        zones: Number(zoneTotal.toFixed(2)),
        gap: Number(gap.toFixed(2)),
        gapPercent: Number(gapPercent.toFixed(2)),
        level: cleanLevel,
        duration: cleanDuration
      };
    }

    // Rule 4: Moderate imbalance requiring observation (loss rate > 8%)
    if (gapPercent > 8) {
      return {
        type: 'Monitor',
        severity: 'warn',
        title: 'Flow imbalance needs monitoring',
        description: 'The balance gap is elevated (>8%) but has not yet met the critical persistence duration threshold.',
        inlet: cleanInlet,
        zones: Number(zoneTotal.toFixed(2)),
        gap: Number(gap.toFixed(2)),
        gapPercent: Number(gapPercent.toFixed(2)),
        level: cleanLevel,
        duration: cleanDuration
      };
    }

    // Rule 5: Normal balanced operation
    return {
      type: 'Normal',
      severity: 'normal',
      title: 'Flow balance is within tolerance',
      description: 'Unexplained flow is below the action threshold.',
      inlet: cleanInlet,
      zones: Number(zoneTotal.toFixed(2)),
      gap: Number(gap.toFixed(2)),
      gapPercent: Number(gapPercent.toFixed(2)),
      level: cleanLevel,
      duration: cleanDuration
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
  function calculateReserve({
    capacity = 5000,
    level = 50,
    gap = 0,
    profile = 'school'
  } = {}) {
    const cleanCapacity = Math.max(1, Number(capacity) || 5000);
    const cleanLevel = Math.min(100, Math.max(0, Number(level) || 0));
    const cleanGap = Math.max(0, Number(gap) || 0);

    const isClinic = profile === 'clinic';
    const demandPerHour = isClinic ? 180 : 120;
    const reserveFraction = isClinic ? 0.30 : 0.20;

    const currentLitres = cleanCapacity * (cleanLevel / 100);
    const protectedReserveLitres = cleanCapacity * reserveFraction;
    const usableLitres = Math.max(0, currentLitres - protectedReserveLitres);

    const lossBurdenPerHour = cleanGap * 60;
    const totalHourlyBurn = Math.max(1, demandPerHour + lossBurdenPerHour);
    const hoursRemaining = usableLitres / totalHourlyBurn;
    const percentOf24h = Math.min(100, (hoursRemaining / 24) * 100);

    return {
      hoursRemaining: Number(hoursRemaining.toFixed(1)),
      percentOf24h: Math.round(percentOf24h),
      usableLitres: Math.round(usableLitres),
      demandPerHour,
      lossBurdenPerHour: Math.round(lossBurdenPerHour),
      protectedReserveLitres: Math.round(protectedReserveLitres)
    };
  }

  /**
   * Assess tank maintenance attention signals and recommend inspection/cleaning interval.
   *
   * @param {Object} observations
   * @param {number} observations.turbidity - Turbidity in NTU
   * @param {number} observations.tds - Current Total Dissolved Solids in ppm
   * @param {number} observations.tdsBase - Usual TDS baseline in ppm
   * @param {number} observations.temp - Water temperature in Celsius
   * @param {number} observations.days - Days elapsed since last physical inspection
   * @param {number} observations.turnover - Tank turnover frequency per week
   * @returns {Object} attention score and advisories
   */
  function assessTankHealth({
    turbidity = 1.0,
    tds = 200,
    tdsBase = 200,
    temp = 25,
    days = 30,
    turnover = 3
  } = {}) {
    const cleanTurb = Math.max(0, Number(turbidity) || 0);
    const cleanTds = Math.max(0, Number(tds) || 0);
    const cleanBase = Math.max(1, Number(tdsBase) || 200);
    const cleanTemp = Number(temp) || 25;
    const cleanDays = Math.max(0, Number(days) || 0);
    const cleanTurnover = Math.max(0, Number(turnover) || 0);

    let penalty = 0;
    const reasons = [];

    if (cleanTurb > 5) {
      penalty += 30;
      reasons.push('Turbidity elevated above 5 NTU');
    } else if (cleanTurb > 1.5) {
      penalty += 10;
      reasons.push('Visible clarity degradation trend (>1.5 NTU)');
    }

    const tdsVariance = Math.abs(cleanTds - cleanBase) / cleanBase;
    if (tdsVariance > 0.25) {
      penalty += 20;
      reasons.push('TDS deviation >25% from established baseline');
    }

    if (cleanTemp > 30) {
      penalty += 10;
      reasons.push('Elevated water temperature (>30°C)');
    }

    if (cleanDays > 90) {
      penalty += 25;
      reasons.push('Physical inspection overdue (>90 days)');
    } else if (cleanDays > 45) {
      penalty += 10;
      reasons.push('Inspection interval approaching review (>45 days)');
    }

    if (cleanTurnover < 1) {
      penalty += 15;
      reasons.push('Low tank turnover rate (stagnation risk <1/week)');
    }

    const score = Math.max(0, 100 - penalty);
    let title = 'Routine monitoring';
    if (score < 60) {
      title = 'Inspect and plan maintenance soon';
    } else if (score < 80) {
      title = 'Schedule tank inspection';
    }

    return {
      score,
      title,
      reasons,
      summary: reasons.length
        ? 'Key signals: ' + reasons.join('; ') + '. Physical inspection recommended.'
        : 'All measured observation signals are within typical operating baselines.'
    };
  }

  return {
    classifyDetection,
    calculateReserve,
    assessTankHealth
  };
});
