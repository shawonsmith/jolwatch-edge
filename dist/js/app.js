/**
 * JolWatch Edge - Application UI Controller
 * Author: Shawon Khan
 *
 * Handles DOM interaction, bilingual UI translation, offline storage,
 * safe incident rendering, simulated sync/export, and accessibility.
 */

(function () {
  'use strict';

  // Helper selectors
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const getNumber = (id) => Math.max(0, Number($('#' + id).value) || 0);

  // Application State
  let currentResult = null;
  let beforeRepair = null;
  let cleanBaseScore = null;
  let currentLang = 'en';
  let demoStep = -1;

  // Canonical Preset Test Scenarios: [inlet, level, z1, z2, z3, z4, duration]
  // Synchronized strictly with docs/TESTING.md
  const testPresets = {
    normal: [32.0, 64, 10.5, 7.0, 8.0, 5.0, 20],
    leak: [44.0, 62, 11.0, 6.0, 7.0, 5.0, 35],
    overflow: [52.0, 98, 8.0, 5.0, 4.0, 3.0, 20],
    mismatch: [25.0, 60, 12.0, 9.0, 8.0, 5.0, 10]
  };

  // Guided demo steps
  const demoCases = [
    ['normal', '1/4 · Normal flow', 'Expected result: flow balance remains within tolerance (<8%).'],
    ['leak', '2/4 · Hidden leak', 'Expected result: persistent unexplained flow (>15% for ≥15 min) triggers a critical alert.'],
    ['overflow', '3/4 · Tank overflow', 'Expected result: high tank level (≥95%) and flow gap trigger an overflow alert.'],
    ['mismatch', '4/4 · Sensor mismatch', 'Expected result: inconsistent totals (zones > inlet) are flagged before action.']
  ];

  // Internationalization Dictionary (English & Bangla)
  const translations = {
    en: {
      tagline: 'Water decisions, even offline',
      title: 'Facility Water Intelligence',
      subtitle: 'Explainable edge rules for schools, clinics and community buildings.',
      prototype: 'Interactive software prototype · simulated readings',
      sync: 'Simulate Sync / Export',
      syncTooltip: 'In this prototype, data remains strictly device-local. No external server API is contacted.',
      operations: 'Operations',
      tankHealth: 'Maintenance Advisor',
      incidents: 'Incident Log',
      readings: '1. Enter current readings',
      testCases: 'Test cases:',
      analyze: 'Analyze readings',
      decision: '2. Explainable decision',
      why: 'Why this result?',
      estimated: 'scenario estimate',
      reserveClock: 'Essential Reserve Clock',
      remaining: 'estimated remaining',
      reserveNote: 'Prioritises minimum essential demand; planning estimate based on facility baseline.',
      repair: 'Alert → Repair → Verify',
      repairHint: 'Analyze an abnormal case, record baseline, then enter after-repair readings to verify improvement.',
      capture: 'Capture alert baseline',
      simulateRepair: 'Simulate repair',
      verify: 'Verify & save incident',
      tankInputs: 'Tank condition observations',
      assess: 'Assess inspection signals',
      advisor: 'Maintenance Attention Indicator',
      safety: 'Safety note: This prototype evaluates physical observation signals for cleaning planning. It cannot detect pathogens, arsenic, or dissolved toxins and does not certify drinking water safety.',
      cleanVerify: 'Cleaning verification',
      cleanText: 'Record baseline attention score, update observations after servicing, and compare score changes.',
      saveBefore: 'Save before-cleaning score',
      compareAfter: 'Compare after-cleaning',
      incidentLog: 'Device-local incident log',
      offlineText: 'Saved in browser localStorage. Click Export to download incident records as JSON.',
      clear: 'Clear log',
      exportJson: 'Export JSON',
      simSyncBtn: 'Simulate sync'
    },
    bn: {
      tagline: 'ইন্টারনেট ছাড়াও পানির সিদ্ধান্ত',
      title: 'প্রতিষ্ঠানের পানি ব্যবস্থাপনা',
      subtitle: 'স্কুল, ক্লিনিক ও কমিউনিটি ভবনের জন্য ব্যাখ্যাযোগ্য লোকাল নিয়ম।',
      prototype: 'ইন্টার‍্যাক্টিভ সফটওয়্যার প্রোটোটাইপ · সিমুলেটেড রিডিং',
      sync: 'সিঙ্ক সিমুলেশন / এক্সপোর্ট',
      syncTooltip: 'এই প্রোটোটাইপে ডেটা সম্পূর্ণ ডিভাইসের ব্রাউজারে থাকে। কোনো বহিরাগত সার্ভার এপিআই যুক্ত নেই।',
      operations: 'অপারেশন',
      tankHealth: 'রক্ষণাবেক্ষণ পরামর্শক',
      incidents: 'ঘটনার ইতিহাস',
      readings: '১. বর্তমান রিডিং দিন',
      testCases: 'টেস্ট কেস:',
      analyze: 'রিডিং বিশ্লেষণ',
      decision: '২. ব্যাখ্যাযোগ্য সিদ্ধান্ত',
      why: 'কেন এই ফলাফল?',
      estimated: 'আনুমানিক হিসাব',
      reserveClock: 'জরুরি পানি রিজার্ভ ঘড়ি',
      remaining: 'আনুমানিক অবশিষ্ট',
      reserveNote: 'ন্যূনতম জরুরি চাহিদাকে অগ্রাধিকার দেয়; এটি পরিকল্পনার হিসাব, নিশ্চয়তা নয়।',
      repair: 'সতর্কতা → মেরামত → যাচাই',
      repairHint: 'অস্বাভাবিক কেস বিশ্লেষণ করে baseline সংরক্ষণ করুন, তারপর মেরামতের পরের রিডিং দিয়ে উন্নতি যাচাই করুন।',
      capture: 'সতর্কতার baseline নিন',
      simulateRepair: 'মেরামত সিমুলেট করুন',
      verify: 'যাচাই ও ঘটনা সংরক্ষণ',
      tankInputs: 'ট্যাংকের পর্যবেক্ষণ',
      assess: 'পর্যবেক্ষণ সংকেত যাচাই',
      advisor: 'রক্ষণাবেক্ষণ মনোযোগ সূচক (Indicator)',
      safety: 'সীমাবদ্ধতা: এই প্রোটোটাইপ কেবল পরিষ্কারের পরিকল্পনা নির্দেশ করে। এটি ব্যাকটেরিয়া, আর্সেনিক বা বিষাক্ত পদার্থ শনাক্ত করে না এবং খাবার পানির সনদ দেয় না।',
      cleanVerify: 'পরিষ্কার করার ফল যাচাই',
      cleanText: 'বর্তমান স্কোর রাখুন, পরিদর্শন/পরিষ্কারের পর তথ্য বদলে তুলনা করুন। বেশি স্কোর উন্নতির ইঙ্গিত দেয়।',
      saveBefore: 'আগের স্কোর রাখুন',
      compareAfter: 'পরের স্কোর তুলনা',
      incidentLog: 'ডিভাইসে সংরক্ষিত ঘটনার তালিকা',
      offlineText: 'এই ব্রাউজারে সংরক্ষিত। সমস্ত রেকর্ড JSON হিসেবে ডাউনলোড করতে Export চাপুন।',
      clear: 'তালিকা মুছুন',
      exportJson: 'JSON এক্সপোর্ট',
      simSyncBtn: 'সিঙ্ক সিমুলেট'
    }
  };

  function updateLanguage() {
    document.documentElement.lang = currentLang;
    $$('[data-i18n]').forEach((elem) => {
      const key = elem.dataset.i18n;
      if (translations[currentLang] && translations[currentLang][key]) {
        elem.textContent = translations[currentLang][key];
      }
    });
    $('#lang').textContent = currentLang === 'en' ? 'বাংলা' : 'English';
  }

  // Operations: Run detection analysis
  function runAnalysis() {
    const inlet = getNumber('inlet');
    const level = Math.min(100, getNumber('level'));
    const zones = ['z1', 'z2', 'z3', 'z4'].map((id) => getNumber(id));
    const duration = getNumber('duration');

    // Run core engine logic
    const engineResult = window.JolWatchEngine.classifyDetection({
      inlet,
      level,
      zones,
      duration
    });

    currentResult = engineResult;

    // Update Metrics
    $('#mInlet').textContent = inlet.toFixed(1);
    $('#mZones').textContent = engineResult.zones.toFixed(1);
    $('#mGap').textContent = engineResult.gap.toFixed(1);
    $('#mGapPct').textContent = engineResult.gapPercent.toFixed(1) + '% of inlet';

    // Update Decision Box
    const box = $('#decisionBox');
    box.className = 'alert ' + (engineResult.severity === 'normal' ? '' : engineResult.severity);
    $('#decisionStatus').textContent = engineResult.type;
    $('#decisionTitle').textContent = engineResult.title;
    $('#decisionText').textContent = engineResult.description;

    // Explanatory steps
    $('#rules').innerHTML = `
      <div class="step ${engineResult.gapPercent <= 8 ? 'done' : ''}">
        Balance gap: <b>${engineResult.gapPercent.toFixed(1)}%</b> · rule: &gt;15% triggers leak alert
      </div>
      <div class="step ${duration < 15 ? 'done' : ''}">
        Duration: <b>${duration} min</b> · rule: persistence ≥15 min
      </div>
      <div class="step ${level < 95 ? 'done' : ''}">
        Tank level: <b>${level}%</b> · rule: tank level ≥95% for overflow
      </div>
    `;

    // Update Reserve Clock
    updateReserve(inlet, engineResult.gap);

    // Update Repair Baseline state
    $('#capture').disabled = engineResult.severity === 'normal';
    $('#repairActive').classList.add('hidden');
    $('#repairIdle').classList.remove('hidden');

    return currentResult;
  }

  // Essential Reserve Clock Calculator
  function updateReserve(inlet, gap) {
    const capacity = getNumber('capacity');
    const level = Math.min(100, getNumber('level'));
    const profile = $('#profile').value;

    const reserveData = window.JolWatchEngine.calculateReserve({
      capacity,
      level,
      gap,
      profile
    });

    $('#mReserve').textContent = reserveData.hoursRemaining.toFixed(1) + ' h';
    $('#reserveHours').textContent = reserveData.hoursRemaining.toFixed(1) + ' h';
    $('#reserveRing').style.setProperty('--p', reserveData.percentOf24h + '%');
    $('#reserveBar').style.width = reserveData.percentOf24h + '%';
    $('#reserveExplain').textContent = `${reserveData.usableLitres} L usable above protected reserve. Estimated baseline demand: ${reserveData.demandPerHour} L/hour; loss burden: ${reserveData.lossBurdenPerHour} L/hour.`;
  }

  // Tank Maintenance Assessment
  function runTankAssessment() {
    const observations = {
      turbidity: getNumber('turbidity'),
      tds: getNumber('tds'),
      tdsBase: Math.max(1, getNumber('tdsBase')),
      temp: getNumber('temp'),
      days: getNumber('days'),
      turnover: getNumber('turnover')
    };

    const result = window.JolWatchEngine.assessTankHealth(observations);

    $('#healthScore').textContent = result.score;
    $('#healthBar').style.width = result.score + '%';
    $('#healthBar').style.background =
      result.score < 60 ? 'var(--red)' : result.score < 80 ? 'var(--amber)' : 'var(--teal)';
    $('#healthTitle').textContent = result.title;
    $('#healthText').textContent = result.summary;

    return result.score;
  }

  // Incident Logging & Safe Storage
  function getIncidents() {
    try {
      const parsed = JSON.parse(localStorage.getItem('jolwatch-incidents') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveIncidents(list) {
    localStorage.setItem('jolwatch-incidents', JSON.stringify(list));
    renderLog();
  }

  // Safe DOM table rendering (prevents XSS from corrupted/injected localStorage)
  function renderLog() {
    const list = getIncidents();
    const tbody = $('#incidentRows');
    tbody.innerHTML = '';

    list.forEach((item) => {
      const tr = document.createElement('tr');

      const tdTime = document.createElement('td');
      tdTime.textContent = String(item.time || '');

      const tdType = document.createElement('td');
      tdType.textContent = String(item.type || '');

      const tdBefore = document.createElement('td');
      tdBefore.textContent = (Number(item.before) || 0).toFixed(1) + ' L/min';

      const tdAfter = document.createElement('td');
      tdAfter.textContent = (Number(item.after) || 0).toFixed(1) + ' L/min';

      const tdOutcome = document.createElement('td');
      tdOutcome.textContent = String(item.outcome || '');

      const tdSync = document.createElement('td');
      tdSync.textContent = item.synced ? 'Simulated sync' : 'Local only';
      tdSync.style.color = item.synced ? 'var(--green)' : 'var(--muted)';

      tr.appendChild(tdTime);
      tr.appendChild(tdType);
      tr.appendChild(tdBefore);
      tr.appendChild(tdAfter);
      tr.appendChild(tdOutcome);
      tr.appendChild(tdSync);
      tbody.appendChild(tr);
    });

    $('#emptyLog').classList.toggle('hidden', list.length > 0);
    $('#queueN').textContent = list.filter((item) => !item.synced).length;
  }

  // Network Status Monitor
  function checkNetworkStatus() {
    const isOnline = navigator.onLine;
    const badge = $('#netBadge');
    badge.textContent = isOnline ? '● Online (Browser)' : '● Offline (Browser)';
    badge.classList.toggle('offline', !isOnline);
  }

  // Guided Evidence Demo Tour
  function runDemoStep() {
    demoStep++;
    if (demoStep >= demoCases.length) {
      demoStep = -1;
      $('#demoBanner').classList.remove('active');
      $('#guidedDemo').textContent = '▶ Guided demo';
      return;
    }

    const currentCase = demoCases[demoStep];
    document.querySelector('[data-tab="ops"]').click();
    document.querySelector('[data-case="' + currentCase[0] + '"]').click();

    $('#demoTitle').textContent = currentCase[1];
    $('#demoText').textContent = currentCase[2];
    $('#demoProgress').style.width = ((demoStep + 1) / demoCases.length) * 100 + '%';
    $('#demoNext').textContent = demoStep === demoCases.length - 1 ? 'Finish' : 'Next case';
    $('#guidedDemo').textContent = '■ Stop demo';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Export incidents as a JSON file
  function exportIncidentsJSON() {
    const data = getIncidents();
    if (data.length === 0) {
      alert('No incidents to export yet.');
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jolwatch-incidents-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Event Listeners Initialization
  function initEvents() {
    // Navigation Tabs
    $$('[data-tab]').forEach((tabBtn) => {
      tabBtn.onclick = () => {
        $$('.tab').forEach((t) => t.classList.remove('active'));
        $$('.panel').forEach((p) => p.classList.remove('active'));
        tabBtn.classList.add('active');
        $('#' + tabBtn.dataset.tab).classList.add('active');
      };
    });

    // Preset test case buttons
    $$('[data-case]').forEach((btn) => {
      btn.onclick = () => {
        const values = testPresets[btn.dataset.case];
        ['inlet', 'level', 'z1', 'z2', 'z3', 'z4', 'duration'].forEach((id, index) => {
          $('#' + id).value = values[index];
        });
        runAnalysis();
      };
    });

    // Facility Profile change triggers reserve recalculation
    $('#profile').onchange = () => {
      if (currentResult) {
        updateReserve(getNumber('inlet'), currentResult.gap);
      }
    };

    // Analyze button
    $('#analyze').onclick = runAnalysis;

    // Alert-Repair-Verify workflow
    $('#capture').onclick = () => {
      beforeRepair = { ...currentResult };
      $('#beforeLoss').textContent = beforeRepair.gap.toFixed(1) + ' L/min';
      $('#repairIdle').classList.add('hidden');
      $('#repairActive').classList.remove('hidden');
    };

    $('#simulateRepair').onclick = () => {
      const zSum = getNumber('z1') + getNumber('z2') + getNumber('z3') + getNumber('z4');
      $('#inlet').value = (zSum + 0.8).toFixed(1);
      $('#level').value = Math.min(88, getNumber('level'));
      runAnalysis();
      $('#repairIdle').classList.add('hidden');
      $('#repairActive').classList.remove('hidden');
      if (beforeRepair) {
        $('#beforeLoss').textContent = beforeRepair.gap.toFixed(1) + ' L/min';
      }
    };

    $('#verify').onclick = () => {
      const after = runAnalysis();
      const reduction = beforeRepair ? Math.max(0, beforeRepair.gap - after.gap) : 0;
      const verified = beforeRepair && after.gap < beforeRepair.gap * 0.5;
      const outcome = verified ? 'Verified improvement' : 'Needs further investigation';

      const incidents = getIncidents();
      incidents.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: beforeRepair ? beforeRepair.type : 'Alert',
        before: beforeRepair ? beforeRepair.gap : 0,
        after: after.gap,
        outcome,
        synced: false
      });

      saveIncidents(incidents);
      $('#verifyResult').textContent = outcome + ' · ' + reduction.toFixed(1) + ' L/min reduction';
      $('#repairIdle').classList.add('hidden');
      $('#repairActive').classList.remove('hidden');
    };

    // Tank Maintenance actions
    $('#tankAnalyze').onclick = runTankAssessment;

    $('#cleanBefore').onclick = () => {
      cleanBaseScore = runTankAssessment();
      $('#cleanAfter').disabled = false;
      $('#cleanResult').textContent = 'Baseline: ' + cleanBaseScore + '/100';
    };

    $('#cleanAfter').onclick = () => {
      const newScore = runTankAssessment();
      const diff = newScore - cleanBaseScore;
      $('#cleanResult').textContent = `Change: ${diff >= 0 ? '+' : ''}${diff} points (indicator)`;
    };

    // Honest Sync Simulation Button
    $('#syncBtn').onclick = () => {
      const pending = getIncidents().filter((item) => !item.synced).length;
      if (pending === 0) {
        alert('All incident records are already marked as simulated sync.');
        return;
      }
      const confirmed = confirm(
        `Prototype notice:\nThere is no external cloud database attached in this offline prototype.\n\nMark ${pending} local record(s) as "Simulated sync" for demonstration purposes?`
      );
      if (confirmed) {
        const synced = getIncidents().map((item) => ({ ...item, synced: true }));
        saveIncidents(synced);
      }
    };

    // Export JSON button
    const exportBtn = $('#exportJsonBtn');
    if (exportBtn) {
      exportBtn.onclick = exportIncidentsJSON;
    }

    // Clear incident history
    $('#clearLog').onclick = () => {
      if (confirm('Clear local incident history?')) {
        saveIncidents([]);
      }
    };

    // Language toggle
    $('#lang').onclick = () => {
      currentLang = currentLang === 'en' ? 'bn' : 'en';
      updateLanguage();
    };

    // Guided Demo button
    $('#guidedDemo').onclick = () => {
      if (demoStep >= 0) {
        demoStep = -1;
        $('#demoBanner').classList.remove('active');
        $('#guidedDemo').textContent = '▶ Guided demo';
      } else {
        $('#demoBanner').classList.add('active');
        runDemoStep();
      }
    };

    $('#demoNext').onclick = runDemoStep;

    // Window network listeners
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);
  }

  // Initialize Application on DOM Ready
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    runAnalysis();
    runTankAssessment();
    renderLog();
    checkNetworkStatus();
    updateLanguage();
  });
})();
