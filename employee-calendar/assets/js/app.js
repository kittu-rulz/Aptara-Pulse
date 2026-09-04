/**
 * Aptara Pulse Employee Calendar - Core Interactive Controller (V2.1 Signature Visual Edition)
 * Zero runtime external dependencies • 100% Client-Side
 */

(function () {
  'use strict';

  // State Management
  let calendarInstance = null;
  let fuseInstance = null;
  let selectedCategories = new Set(['all']);
  let isUpcomingOnly = false;
  let searchQuery = '';
  let activeModalEvent = null;
  let lastFocusedElement = null;

  const calendarData = window.APTARA_CALENDAR_DATA || {
    organization: {},
    theme: {},
    categories: [],
    events: []
  };

  /**
   * Check Reduced Motion Preference
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Check Touch Device
   */
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  /**
   * DOM Ready Initializer
   */
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initLucideIcons();
    initThemeAndHeroData();
    initHeroPointerLighting();
    initNextUpEvent();
    initStatsCards();
    initFeaturedEditorialShowcase();
    initSearchEngine();
    initCategoryFilters();
    initUpcomingToggle();
    initClearFiltersAction();
    initCalendarView();
    initTimelineAgenda();
    initTimelineScrollObserver();
    initModalControls();
    initBackToTop();
    initSmoothScroll();
    initKeyboardAccessibility();
    initEntranceAnimations();
    checkUrlHashOnLoad();
  });

  /**
   * Refresh Lucide Icons in DOM safely
   */
  function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Sticky Header Scroll Shadow & Compact height
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /**
   * Populate Theme, Hero Text & Experience Counter
   */
  function initThemeAndHeroData() {
    const org = calendarData.organization || {};
    const theme = calendarData.theme || {};
    const events = calendarData.events || [];

    const heroTitle = document.getElementById('hero-title');
    const heroStatement = document.getElementById('hero-statement');
    const heroMonth = document.getElementById('hero-month-badge');
    const heroMessage = document.getElementById('hero-message');
    const expCounterText = document.getElementById('hero-exp-count-text');

    if (heroTitle && org.portalTitle) heroTitle.textContent = org.portalTitle;
    if (heroStatement) {
      heroStatement.textContent = theme.tagline || org.statement || "Learn. Connect. Celebrate.";
    }
    if (heroMonth) {
      heroMonth.textContent = theme.eyebrow || org.monthLabel || "September 2026 Edition";
    }
    if (heroMessage && (org.descriptor || org.monthlyMessage)) {
      heroMessage.textContent = org.descriptor || org.monthlyMessage;
    }
    if (expCounterText) {
      expCounterText.textContent = `${events.length} experiences scheduled this month`;
    }
  }

  /**
   * Pointer-Responsive Ambient Lighting (Desktop only, subtle & restrained)
   */
  function initHeroPointerLighting() {
    if (prefersReducedMotion() || isTouchDevice()) return;

    const hero = document.getElementById('hero');
    if (!hero) return;

    let ticking = false;

    hero.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          hero.style.setProperty('--mouse-x', `${x}px`);
          hero.style.setProperty('--mouse-y', `${y}px`);
          ticking = false;
        });
        ticking = true;
      }
    });

    hero.addEventListener('mouseleave', () => {
      hero.style.setProperty('--mouse-x', '50%');
      hero.style.setProperty('--mouse-y', '50%');
    });
  }

  /**
   * Dynamic "Next Up / Happening Today" Glass Panel Evaluator
   */
  function initNextUpEvent() {
    const container = document.getElementById('hero-next-up-container');
    if (!container) return;

    const events = calendarData.events || [];
    if (events.length === 0) {
      container.innerHTML = `
        <div class="next-up-card">
          <div class="next-up-header">
            <span class="next-up-status-badge">Schedule Notice</span>
          </div>
          <h3 class="next-up-title">No Events Scheduled</h3>
          <p style="color: #CBD5E1; font-size: 0.85rem;">Check back next month for upcoming training and engagement sessions.</p>
        </div>
      `;
      return;
    }

    const refYear = 2026;
    const refMonth = 8; // September (0-indexed)
    const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

    let nextEvent = null;
    let isToday = false;

    let testDate = new Date();
    if (testDate.getFullYear() !== refYear || testDate.getMonth() !== refMonth) {
      testDate = new Date('2026-09-04T09:00:00');
    }

    for (const evt of sorted) {
      const evtStart = new Date(evt.start);
      const isSameDay = evtStart.toDateString() === testDate.toDateString();
      if (isSameDay) {
        nextEvent = evt;
        isToday = true;
        break;
      }
      if (evtStart >= testDate) {
        nextEvent = evt;
        break;
      }
    }

    if (!nextEvent) {
      nextEvent = sorted[0];
    }

    const cat = getCategoryMeta(nextEvent.category);
    const startDate = new Date(nextEvent.start);
    const dateFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    const timeFormatted = nextEvent.allDay ? 'All Day Session' : startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    container.innerHTML = `
      <div class="next-up-card" style="--next-up-accent: ${cat.border}; --next-up-bg: ${cat.bg}; --next-up-color: ${cat.color}; --next-up-border: ${cat.border};">
        <div class="next-up-header">
          <span class="next-up-status-badge ${isToday ? 'today' : ''}">
            <i data-lucide="${isToday ? 'zap' : 'clock'}" style="width: 12px; height: 12px;" aria-hidden="true"></i>
            ${isToday ? 'Happening Today' : 'Next Priority Session'}
          </span>
          <span class="next-up-category-tag">${cat.name}</span>
        </div>

        <h3 class="next-up-title">${escapeHtml(nextEvent.title)}</h3>

        <div class="next-up-meta-grid">
          <div class="next-up-meta-item">
            <i data-lucide="calendar" style="width: 14px; height: 14px;" aria-hidden="true"></i>
            <span>${dateFormatted}</span>
          </div>
          <div class="next-up-meta-item">
            <i data-lucide="clock" style="width: 14px; height: 14px;" aria-hidden="true"></i>
            <span>${timeFormatted}</span>
          </div>
          <div class="next-up-meta-item" style="grid-column: span 2;">
            <i data-lucide="map-pin" style="width: 14px; height: 14px;" aria-hidden="true"></i>
            <span>${escapeHtml(nextEvent.location || 'Virtual')}</span>
          </div>
        </div>

        <div class="next-up-footer">
          <span style="font-size: 0.775rem; color: #CBD5E1; font-weight: 600;">Host: ${escapeHtml(nextEvent.instructor || 'Aptara')}</span>
          <button class="btn-next-up-action" data-event-id="${nextEvent.id}">
            <span>View Details</span>
            <i data-lucide="arrow-right" style="width: 13px; height: 13px;" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;

    const actionBtn = container.querySelector('.btn-next-up-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => openEventModal(nextEvent.id));
    }

    initLucideIcons();
  }

  /**
   * Initialize "At a Glance" Statistics Cards with Progress & Percentages
   */
  function initStatsCards() {
    const events = calendarData.events || [];
    const totalCount = events.length || 1;
    const trainingCount = events.filter(e => e.category === 'training').length;
    const engagementCount = events.filter(e => e.category === 'engagement').length;
    const wellnessCount = events.filter(e => e.category === 'wellness').length;

    const trainingPct = Math.round((trainingCount / totalCount) * 100);
    const engagementPct = Math.round((engagementCount / totalCount) * 100);
    const wellnessPct = Math.round((wellnessCount / totalCount) * 100);

    animateCountUp('stat-val-total', events.length);
    animateCountUp('stat-val-training', trainingCount);
    animateCountUp('stat-val-engagement', engagementCount);
    animateCountUp('stat-val-wellness', wellnessCount);

    const pctTrainingEl = document.getElementById('stat-pct-training');
    const pctEngagementEl = document.getElementById('stat-pct-engagement');
    const pctWellnessEl = document.getElementById('stat-pct-wellness');

    if (pctTrainingEl) pctTrainingEl.textContent = `${trainingPct}% of Month`;
    if (pctEngagementEl) pctEngagementEl.textContent = `${engagementPct}% of Month`;
    if (pctWellnessEl) pctWellnessEl.textContent = `${wellnessPct}% of Month`;

    const barTraining = document.getElementById('stat-bar-training');
    const barEngagement = document.getElementById('stat-bar-engagement');
    const barWellness = document.getElementById('stat-bar-wellness');

    if (barTraining) barTraining.style.width = `${trainingPct}%`;
    if (barEngagement) barEngagement.style.width = `${engagementPct}%`;
    if (barWellness) barWellness.style.width = `${wellnessPct}%`;

    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const filterVal = card.getAttribute('data-filter');
        if (filterVal) {
          document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-stat-filter'));
          card.classList.add('active-stat-filter');
          applyCategoryFilter(filterVal);
          const calEl = document.getElementById('calendar');
          if (calEl) calEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  function animateCountUp(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = targetValue;
      return;
    }
    let current = 0;
    const duration = 400;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      current = Math.round(easeProgress * targetValue);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = targetValue;
    }
    requestAnimationFrame(update);
  }

  /**
   * Data-Driven Category SVG Artwork Mesh Generator for Featured Poster
   */
  function getCategorySvgArtwork(category) {
    switch (category) {
      case 'training':
        return `
          <svg class="poster-svg-mesh" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mesh-train-grad" x1="0" y1="0" x2="600" y2="180" gradientUnits="userSpaceOnUse">
                <stop stop-color="#071626" />
                <stop offset="0.5" stop-color="#0E3D6E" />
                <stop offset="1" stop-color="#145DA0" />
              </linearGradient>
              <radialGradient id="train-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(46, 134, 222, 0.3)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
            <rect width="600" height="180" fill="url(#mesh-train-grad)" />
            <circle cx="300" cy="90" r="140" fill="url(#train-glow)" />
            <circle cx="300" cy="90" r="65" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-dasharray="4 4" />
            <circle cx="300" cy="90" r="110" stroke="rgba(144, 205, 244, 0.15)" stroke-width="1" />
            <circle cx="300" cy="90" r="155" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6 6" />
            <path d="M0 90 L235 90 M365 90 L600 90" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
            <path d="M120 180 L255 90 M345 90 L480 0" stroke="rgba(144, 205, 244, 0.12)" stroke-width="1" stroke-dasharray="3 3" />
            <g opacity="0.1" fill="#FFFFFF">
              <circle cx="80" cy="45" r="1.5"/><circle cx="140" cy="45" r="1.5"/><circle cx="200" cy="45" r="1.5"/><circle cx="400" cy="45" r="1.5"/><circle cx="460" cy="45" r="1.5"/><circle cx="520" cy="45" r="1.5"/>
              <circle cx="80" cy="135" r="1.5"/><circle cx="140" cy="135" r="1.5"/><circle cx="200" cy="135" r="1.5"/><circle cx="400" cy="135" r="1.5"/><circle cx="460" cy="135" r="1.5"/><circle cx="520" cy="135" r="1.5"/>
            </g>
          </svg>
        `;
      case 'engagement':
        return `
          <svg class="poster-svg-mesh" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mesh-eng-grad" x1="0" y1="0" x2="600" y2="180" gradientUnits="userSpaceOnUse">
                <stop stop-color="#130B21" />
                <stop offset="0.5" stop-color="#41246F" />
                <stop offset="1" stop-color="#6B4C9A" />
              </linearGradient>
              <radialGradient id="eng-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(242, 184, 75, 0.25)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
            <rect width="600" height="180" fill="url(#mesh-eng-grad)" />
            <circle cx="300" cy="90" r="140" fill="url(#eng-glow)" />
            <circle cx="300" cy="90" r="65" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4 4" />
            <circle cx="300" cy="90" r="110" stroke="rgba(242, 184, 75, 0.2)" stroke-width="1.2" />
            <circle cx="300" cy="90" r="155" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6 6" />
            <path d="M0 90 L235 90 M365 90 L600 90" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
            <path d="M160 0 L255 90 M345 90 L440 180" stroke="rgba(242, 184, 75, 0.15)" stroke-width="1" stroke-dasharray="3 3" />
            <g opacity="0.1" fill="#FFFFFF">
              <circle cx="80" cy="45" r="1.5"/><circle cx="140" cy="45" r="1.5"/><circle cx="200" cy="45" r="1.5"/><circle cx="400" cy="45" r="1.5"/><circle cx="460" cy="45" r="1.5"/><circle cx="520" cy="45" r="1.5"/>
              <circle cx="80" cy="135" r="1.5"/><circle cx="140" cy="135" r="1.5"/><circle cx="200" cy="135" r="1.5"/><circle cx="400" cy="135" r="1.5"/><circle cx="460" cy="135" r="1.5"/><circle cx="520" cy="135" r="1.5"/>
            </g>
          </svg>
        `;
      case 'wellness':
        return `
          <svg class="poster-svg-mesh" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mesh-well-grad" x1="0" y1="0" x2="600" y2="180" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1C0A11" />
                <stop offset="0.5" stop-color="#781C2D" />
                <stop offset="1" stop-color="#E85D75" />
              </linearGradient>
              <radialGradient id="well-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(232, 93, 117, 0.3)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
            <rect width="600" height="180" fill="url(#mesh-well-grad)" />
            <circle cx="300" cy="90" r="140" fill="url(#well-glow)" />
            <circle cx="300" cy="90" r="65" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4 4" />
            <circle cx="300" cy="90" r="110" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
            <circle cx="300" cy="90" r="155" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6 6" />
            <path d="M0 90 L235 90 M365 90 L600 90" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
            <path d="M120 0 L240 90 M360 90 L480 180" stroke="rgba(232, 93, 117, 0.2)" stroke-width="1" stroke-dasharray="3 3" />
            <g opacity="0.1" fill="#FFFFFF">
              <circle cx="80" cy="45" r="1.5"/><circle cx="140" cy="45" r="1.5"/><circle cx="200" cy="45" r="1.5"/><circle cx="400" cy="45" r="1.5"/><circle cx="460" cy="45" r="1.5"/><circle cx="520" cy="45" r="1.5"/>
              <circle cx="80" cy="135" r="1.5"/><circle cx="140" cy="135" r="1.5"/><circle cx="200" cy="135" r="1.5"/><circle cx="400" cy="135" r="1.5"/><circle cx="460" cy="135" r="1.5"/><circle cx="520" cy="135" r="1.5"/>
            </g>
          </svg>
        `;
      case 'townhall':
      default:
        return `
          <svg class="poster-svg-mesh" viewBox="0 0 600 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mesh-town-grad" x1="0" y1="0" x2="600" y2="180" gradientUnits="userSpaceOnUse">
                <stop stop-color="#051221" />
                <stop offset="0.55" stop-color="#0C2540" />
                <stop offset="1" stop-color="#145DA0" />
              </linearGradient>
              <radialGradient id="town-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(242, 184, 75, 0.25)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
            <rect width="600" height="180" fill="url(#mesh-town-grad)" />
            <circle cx="300" cy="90" r="140" fill="url(#town-glow)" />
            <circle cx="300" cy="90" r="65" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4 4" />
            <circle cx="300" cy="90" r="110" stroke="rgba(242, 184, 75, 0.25)" stroke-width="1.2" />
            <circle cx="300" cy="90" r="155" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="6 6" />
            <path d="M0 90 L235 90 M365 90 L600 90" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
            <g opacity="0.1" fill="#FFFFFF">
              <circle cx="80" cy="45" r="1.5"/><circle cx="140" cy="45" r="1.5"/><circle cx="200" cy="45" r="1.5"/><circle cx="400" cy="45" r="1.5"/><circle cx="460" cy="45" r="1.5"/><circle cx="520" cy="45" r="1.5"/>
              <circle cx="80" cy="135" r="1.5"/><circle cx="140" cy="135" r="1.5"/><circle cx="200" cy="135" r="1.5"/><circle cx="400" cy="135" r="1.5"/><circle cx="460" cy="135" r="1.5"/><circle cx="520" cy="135" r="1.5"/>
            </g>
          </svg>
        `;
    }
  }

  /**
   * Editorial Featured Showcase (Dominant 50% Poster + 3 Supporting Cards)
   */
  function initFeaturedEditorialShowcase() {
    const container = document.getElementById('featured-cards-grid');
    if (!container) return;

    const events = calendarData.events || [];
    const featuredList = events.filter(e => e.featured);

    if (featuredList.length === 0) {
      container.innerHTML = `<p style="color: var(--color-text-muted); font-size: 0.9rem;">No featured sessions selected for this month.</p>`;
      return;
    }

    const primary = featuredList[0];
    const secondaries = featuredList.slice(1, 4);

    const primCat = getCategoryMeta(primary.category);
    const primStart = new Date(primary.start);
    const primDayNum = primStart.getDate();
    const primMonthStr = primStart.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const primTimeStr = primary.allDay ? 'All Day' : primStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const primSvgArtwork = getCategorySvgArtwork(primary.category);

    let html = `
      <!-- 50% Dominant Featured Poster Card -->
      <div class="featured-poster-card" style="--poster-cat-bg: ${primCat.bg}; --poster-cat-color: ${primCat.color}; --poster-cat-border: ${primCat.border};">
        <div class="featured-poster-artwork">
          ${primSvgArtwork}
          <div class="poster-glass-emblem">
            <i data-lucide="${primCat.icon || 'sparkles'}" style="width: 26px; height: 26px;"></i>
          </div>
        </div>

        <div class="featured-poster-body">
          <div class="featured-poster-top">
            <span class="featured-poster-cat" style="background: ${primCat.bg}; color: ${primCat.color}; border: 1px solid ${primCat.border};">
              <i data-lucide="${primCat.icon}" style="width: 12px; height: 12px;"></i>
              ${primCat.name}
            </span>
            <span class="featured-poster-date-badge">
              <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
              ${primDayNum} ${primMonthStr} • ${primTimeStr}
            </span>
          </div>

          <h3 class="featured-poster-title">${escapeHtml(primary.title)}</h3>
          <p class="featured-poster-desc">${escapeHtml(primary.description)}</p>

          <div class="featured-poster-footer">
            <div class="featured-poster-meta">
              <span><i data-lucide="map-pin" style="width: 13px; height: 13px; display: inline; margin-right: 3px;"></i> ${escapeHtml(primary.location || 'Virtual')}</span>
              <span><i data-lucide="user" style="width: 13px; height: 13px; display: inline; margin-right: 3px;"></i> ${escapeHtml(primary.instructor || 'Aptara')}</span>
            </div>
            <button class="btn-card-action btn-card-primary" onclick="window.AptaraPulse.openModal('${primary.id}')">
              <span>View Details</span>
              <i data-lucide="arrow-right" style="width: 13px; height: 13px;"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Secondary Supporting Cards Stack (3 items) -->
      <div class="featured-secondary-stack">
    `;

    secondaries.forEach(sec => {
      const cat = getCategoryMeta(sec.category);
      const start = new Date(sec.start);
      const dayNum = start.getDate();
      const monthStr = start.toLocaleDateString('en-US', { month: 'short' });

      html += `
        <div class="featured-card-secondary" style="--cat-accent: ${cat.border};">
          <div class="featured-sec-info">
            <div class="featured-sec-top">
              <span class="category-tag" style="background: ${cat.bg}; color: ${cat.color};">
                <i data-lucide="${cat.icon}" style="width: 10px; height: 10px;"></i>
                ${cat.name}
              </span>
              <span style="font-size: 0.775rem; font-weight: 800; color: var(--color-blue);">${dayNum} ${monthStr}</span>
            </div>
            <h4 class="featured-sec-title" title="${escapeHtml(sec.title)}">${escapeHtml(sec.title)}</h4>
            <p class="featured-sec-desc">${escapeHtml(sec.description)}</p>
          </div>

          <button class="btn-card-action btn-card-outline" onclick="window.AptaraPulse.openModal('${sec.id}')" aria-label="View details for ${escapeHtml(sec.title)}">
            <span>Details</span>
            <i data-lucide="chevron-right" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    initLucideIcons();
  }

  /**
   * Fuse.js Search Engine Initialization
   */
  function initSearchEngine() {
    const events = calendarData.events || [];
    const options = {
      keys: ['title', 'calendarTitle', 'description', 'instructor', 'tags', 'location', 'audience'],
      threshold: 0.35,
      ignoreLocation: true
    };
    if (window.Fuse) {
      fuseInstance = new window.Fuse(events, options);
    }

    const searchInput = document.getElementById('event-search-input');
    const clearBtn = document.getElementById('btn-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (clearBtn) {
          clearBtn.style.display = searchQuery ? 'block' : 'none';
        }
        filterEvents();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        clearBtn.style.display = 'none';
        filterEvents();
      });
    }
  }

  /**
   * Category Filter Chips in Horizontal Toolbar
   */
  function initCategoryFilters() {
    const container = document.getElementById('category-filters-container');
    if (!container) return;

    const categories = calendarData.categories || [];
    let html = `
      <button class="category-chip-btn active" data-category="all" aria-pressed="true" style="--chip-active-bg: #EDF5FC; --chip-active-border: var(--color-blue); --chip-active-color: var(--color-blue); --chip-dot-color: var(--color-blue);">
        <span class="category-chip-dot"></span>
        <span>All Sessions</span>
      </button>
    `;

    categories.forEach(cat => {
      html += `
        <button class="category-chip-btn" data-category="${cat.id}" aria-pressed="false" style="--chip-active-bg: ${cat.bg}; --chip-active-border: ${cat.border}; --chip-active-color: ${cat.color}; --chip-dot-color: ${cat.border};">
          <span class="category-chip-dot"></span>
          <span>${cat.name}</span>
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.category-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        handleCategoryChipClick(catId, btn);
      });
    });
  }

  function handleCategoryChipClick(catId, btnEl) {
    if (catId === 'all') {
      selectedCategories.clear();
      selectedCategories.add('all');
    } else {
      selectedCategories.delete('all');
      if (selectedCategories.has(catId)) {
        selectedCategories.delete(catId);
        if (selectedCategories.size === 0) {
          selectedCategories.add('all');
        }
      } else {
        selectedCategories.add(catId);
      }
    }
    updateCategoryChipUI();
    filterEvents();
  }

  function updateCategoryChipUI() {
    const container = document.getElementById('category-filters-container');
    if (!container) return;

    container.querySelectorAll('.category-chip-btn').forEach(btn => {
      const catId = btn.getAttribute('data-category');
      const isActive = selectedCategories.has(catId);
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function applyCategoryFilter(catId) {
    selectedCategories.clear();
    selectedCategories.add(catId);
    updateCategoryChipUI();
    filterEvents();
  }

  /**
   * Upcoming Only Toggle
   */
  function initUpcomingToggle() {
    const btn = document.getElementById('toggle-upcoming-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      isUpcomingOnly = !isUpcomingOnly;
      btn.setAttribute('aria-pressed', isUpcomingOnly ? 'true' : 'false');
      filterEvents();
    });
  }

  /**
   * Clear All Filters Action
   */
  function initClearFiltersAction() {
    const btn = document.getElementById('btn-clear-filters');
    const emptyResetBtn = document.getElementById('btn-empty-reset');

    const resetAll = () => {
      selectedCategories.clear();
      selectedCategories.add('all');
      isUpcomingOnly = false;
      searchQuery = '';

      const searchInput = document.getElementById('event-search-input');
      const clearSearchBtn = document.getElementById('btn-search-clear');
      const upcomingBtn = document.getElementById('toggle-upcoming-btn');

      if (searchInput) searchInput.value = '';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      if (upcomingBtn) upcomingBtn.setAttribute('aria-pressed', 'false');

      document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-stat-filter'));

      updateCategoryChipUI();
      filterEvents();
    };

    if (btn) btn.addEventListener('click', resetAll);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);
  }

  /**
   * Core Filter Engine: Synchronizes Calendar, Agenda, and Counter
   */
  function filterEvents() {
    const allEvents = calendarData.events || [];
    let filtered = [...allEvents];

    if (searchQuery && fuseInstance) {
      const results = fuseInstance.search(searchQuery);
      filtered = results.map(r => r.item);
    }

    if (!selectedCategories.has('all')) {
      filtered = filtered.filter(e => selectedCategories.has(e.category));
    }

    if (isUpcomingOnly) {
      const refDate = new Date('2026-09-04T00:00:00');
      filtered = filtered.filter(e => new Date(e.start) >= refDate);
    }

    const counterEl = document.getElementById('search-result-counter');
    const clearBtn = document.getElementById('btn-clear-filters');
    const isFiltered = !selectedCategories.has('all') || isUpcomingOnly || Boolean(searchQuery);

    if (counterEl) {
      counterEl.textContent = `${filtered.length} Session${filtered.length === 1 ? '' : 's'}`;
    }
    if (clearBtn) {
      clearBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }

    if (calendarInstance) {
      calendarInstance.removeAllEvents();
      calendarInstance.addEventSource(mapEventsToFullCalendar(filtered));
    }

    const emptyState = document.getElementById('calendar-empty-state');
    const fcMount = document.getElementById('fullcalendar-mount');
    if (emptyState && fcMount) {
      if (filtered.length === 0) {
        emptyState.style.display = 'block';
        fcMount.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        fcMount.style.display = 'block';
      }
    }

    renderTimelineAgenda(filtered);
    initTimelineScrollObserver();
  }

  /**
   * Map event objects to FullCalendar format with calendarTitle
   */
  function mapEventsToFullCalendar(eventList) {
    return eventList.map(e => {
      const cat = getCategoryMeta(e.category);
      return {
        id: e.id,
        title: e.calendarTitle || e.title,
        fullTitle: e.title,
        start: e.start,
        end: e.end || e.start,
        allDay: e.allDay,
        extendedProps: {
          category: e.category,
          categoryName: cat.name,
          categoryColor: cat.color,
          categoryBg: cat.bg,
          categoryBorder: cat.border,
          categoryIcon: cat.icon,
          location: e.location,
          instructor: e.instructor,
          description: e.description
        }
      };
    });
  }

  /**
   * FullCalendar Initialization with Category Icons & Custom 2-Line Pills
   */
  function initCalendarView() {
    const mountEl = document.getElementById('fullcalendar-mount');
    if (!mountEl || !window.FullCalendar) return;

    const initialView = window.innerWidth < 768 ? 'listMonth' : 'dayGridMonth';

    calendarInstance = new window.FullCalendar.Calendar(mountEl, {
      initialView: initialView,
      initialDate: '2026-09-01',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      buttonText: {
        today: 'Today',
        month: 'Month',
        list: 'List'
      },
      navLinks: true,
      dayMaxEvents: 3,
      events: mapEventsToFullCalendar(calendarData.events || []),
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        openEventModal(info.event.id);
      },
      eventContent: (arg) => {
        if (arg.view.type === 'dayGridMonth') {
          const catBorder = arg.event.extendedProps.categoryBorder || '#145DA0';
          const catBg = arg.event.extendedProps.categoryBg || '#EDF5FC';
          const catColor = arg.event.extendedProps.categoryColor || '#102A43';
          
          let timeText = '';
          if (!arg.event.allDay && arg.event.start) {
            timeText = arg.event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          } else {
            timeText = 'All Day';
          }

          const customEl = document.createElement('div');
          customEl.className = 'fc-custom-event-pill';
          customEl.style.setProperty('--pill-border', catBorder);
          customEl.style.setProperty('--pill-bg', catBg);
          customEl.style.setProperty('--pill-color', catColor);
          customEl.style.setProperty('--pill-accent', catBorder);
          customEl.title = `${arg.event.extendedProps.fullTitle || arg.event.title} (${timeText}) - ${arg.event.extendedProps.location || ''}`;
          customEl.tabIndex = 0;

          customEl.innerHTML = `
            <span class="fc-pill-time">${timeText}</span>
            <span class="fc-pill-title">${escapeHtml(arg.event.title)}</span>
          `;
          return { domNodes: [customEl] };
        }
        return true;
      },
      windowResize: () => {
        if (window.innerWidth < 768 && calendarInstance.view.type === 'dayGridMonth') {
          calendarInstance.changeView('listMonth');
        }
      }
    });

    calendarInstance.render();
  }

  /**
   * Full-Width Chronological Pulse Timeline Agenda
   */
  function initTimelineAgenda() {
    renderTimelineAgenda(calendarData.events || []);
  }

  function renderTimelineAgenda(eventList) {
    const container = document.getElementById('agenda-timeline-container');
    const badge = document.getElementById('agenda-count-badge');
    if (!container) return;

    if (badge) {
      badge.textContent = `${eventList.length} session${eventList.length === 1 ? '' : 's'} scheduled`;
    }

    if (eventList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <p style="color: var(--color-text-muted);">No agenda items match your current filter selection.</p>
        </div>
      `;
      return;
    }

    const sorted = [...eventList].sort((a, b) => new Date(a.start) - new Date(b.start));

    const groups = {};
    sorted.forEach(evt => {
      const dateKey = evt.start.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(evt);
    });

    let html = '';
    Object.keys(groups).forEach(dateKey => {
      const dateObj = new Date(dateKey + 'T00:00:00');
      const dayNum = dateObj.getDate();
      const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
      const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const evtsInDate = groups[dateKey];

      html += `
        <div class="timeline-group is-visible" data-date="${dateKey}">
          <div class="timeline-date-block">
            <div class="timeline-date-day">${dayNum}</div>
            <div class="timeline-date-month">${monthStr} 2026</div>
            <div class="timeline-date-weekday">${weekdayStr}</div>
          </div>

          <div class="timeline-events-list">
      `;

      evtsInDate.forEach(evt => {
        const cat = getCategoryMeta(evt.category);
        const startTime = evt.allDay ? 'All Day Session' : new Date(evt.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        html += `
          <div class="timeline-event-card" style="--event-border: ${cat.border};">
            <div class="timeline-event-body">
              <div class="timeline-event-header">
                <span class="category-tag" style="background: ${cat.bg}; color: ${cat.color};">
                  <i data-lucide="${cat.icon}" style="width: 11px; height: 11px;"></i>
                  ${cat.name}
                </span>
                <span style="font-size: 0.775rem; font-weight: 700; color: var(--color-blue);">
                  <i data-lucide="clock" style="width: 12px; height: 12px; display: inline; margin-right: 3px;"></i>
                  ${startTime}
                </span>
              </div>

              <h3 class="timeline-event-title">${escapeHtml(evt.title)}</h3>

              <div class="timeline-event-meta">
                <span><i data-lucide="map-pin" style="width: 13px; height: 13px;"></i> ${escapeHtml(evt.location || 'Virtual')}</span>
                <span><i data-lucide="user" style="width: 13px; height: 13px;"></i> ${escapeHtml(evt.instructor || 'Aptara Team')}</span>
                <span><i data-lucide="users" style="width: 13px; height: 13px;"></i> ${escapeHtml(evt.audience || 'All Employees')}</span>
              </div>
            </div>

            <button class="btn-card-action btn-card-outline" onclick="window.AptaraPulse.openModal('${evt.id}')" aria-label="View session details for ${escapeHtml(evt.title)}">
              <span>Details</span>
              <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    initLucideIcons();
  }

  /**
   * IntersectionObserver for Progressive Timeline Axis Illumination
   */
  function initTimelineScrollObserver() {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    const timelineGroups = document.querySelectorAll('.timeline-group');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    });

    timelineGroups.forEach(group => observer.observe(group));
  }

  /**
   * Event Detail Modal Dialog Management
   */
  function initModalControls() {
    const overlay = document.getElementById('event-modal-overlay');
    const closeBtn = document.getElementById('modal-close-button');
    const copyLinkBtn = document.getElementById('modal-btn-copy-link');
    const icsBtn = document.getElementById('modal-btn-ics');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        if (!activeModalEvent) return;
        const shareUrl = `${window.location.origin}${window.location.pathname}#event-${activeModalEvent.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast('Direct event link copied to clipboard!');
        }).catch(() => {
          showToast('Link copied: ' + shareUrl);
        });
      });
    }

    if (icsBtn) {
      icsBtn.addEventListener('click', () => {
        if (!activeModalEvent) return;
        downloadIcsFile(activeModalEvent);
      });
    }
  }

  function openEventModal(eventId) {
    const events = calendarData.events || [];
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;

    activeModalEvent = evt;
    lastFocusedElement = document.activeElement;

    const overlay = document.getElementById('event-modal-overlay');
    const cat = getCategoryMeta(evt.category);

    const titleEl = document.getElementById('modal-title');
    const catEl = document.getElementById('modal-cat-badge');
    const timeEl = document.getElementById('modal-time-val');
    const locEl = document.getElementById('modal-location-val');
    const instEl = document.getElementById('modal-instructor-val');
    const audEl = document.getElementById('modal-audience-val');
    const descEl = document.getElementById('modal-description-val');
    const tagsContainer = document.getElementById('modal-tags-container');
    const joinBtn = document.getElementById('modal-btn-join-link');
    const regBtn = document.getElementById('modal-btn-reg-link');

    if (titleEl) titleEl.textContent = evt.title;
    if (catEl) {
      catEl.textContent = cat.name;
      catEl.style.backgroundColor = cat.bg;
      catEl.style.color = cat.color;
      catEl.style.borderColor = cat.border;
    }

    if (timeEl) {
      const start = new Date(evt.start);
      const dateStr = start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = evt.allDay ? 'All Day Session' : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      timeEl.textContent = `${dateStr} (${timeStr})`;
    }

    if (locEl) locEl.textContent = evt.location || 'Virtual';
    if (instEl) instEl.textContent = evt.instructor || 'Aptara Team';
    if (audEl) audEl.textContent = evt.audience || 'All Employees';
    if (descEl) descEl.textContent = evt.description || 'No additional details provided.';

    if (tagsContainer) {
      if (evt.tags && evt.tags.length > 0) {
        tagsContainer.innerHTML = evt.tags.map(t => `<span class="modal-tag">#${escapeHtml(t)}</span>`).join('');
        tagsContainer.style.display = 'flex';
      } else {
        tagsContainer.style.display = 'none';
      }
    }

    if (joinBtn) {
      if (evt.joinUrl) {
        joinBtn.href = evt.joinUrl;
        joinBtn.style.display = 'inline-flex';
      } else {
        joinBtn.style.display = 'none';
      }
    }

    if (regBtn) {
      if (evt.registrationUrl) {
        regBtn.href = evt.registrationUrl;
        regBtn.style.display = 'inline-flex';
      } else {
        regBtn.style.display = 'none';
      }
    }

    if (overlay) {
      overlay.classList.add('active');
      const focusContainer = document.getElementById('modal-focus-container');
      if (focusContainer) focusContainer.focus();
    }
  }

  function closeModal() {
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    activeModalEvent = null;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  /**
   * RFC 2445 .ICS Calendar File Generator
   */
  function downloadIcsFile(evt) {
    const startIso = evt.start.replace(/[-:]/g, '').split('.')[0];
    let endIso = evt.end ? evt.end.replace(/[-:]/g, '').split('.')[0] : startIso;
    if (evt.allDay) {
      endIso = startIso;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aptara Inc//Aptara Pulse Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${evt.id}@pulse.aptaracorp.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${escapeIcs(evt.title)}`,
      `DESCRIPTION:${escapeIcs(evt.description || '')}`,
      `LOCATION:${escapeIcs(evt.location || 'Virtual')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${evt.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToast('Calendar invite (.ics) downloaded.');
  }

  function escapeIcs(str) {
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  /**
   * Toast Notification Controller
   */
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<i data-lucide="check-circle" style="width: 15px; height: 15px; color: #68D391;"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    initLucideIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }

  /**
   * Floating Back to Top Button
   */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Smooth Anchor Navigation with Active Section Highlighting
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('.nav-link');
    const sections = ['overview', 'highlights', 'calendar', 'agenda', 'contact'];

    window.addEventListener('scroll', () => {
      let currentSection = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            currentSection = id;
          }
        }
      });

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSection}`) {
          link.classList.add('active');
        } else if (currentSection) {
          link.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  /**
   * Keyboard Accessibility & Focus Trap
   */
  function initKeyboardAccessibility() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('event-modal-overlay');
        if (overlay && overlay.classList.contains('active')) {
          closeModal();
        }
      }
    });
  }

  /**
   * Motion One Entrance Micro-Animations
   */
  function initEntranceAnimations() {
    if (prefersReducedMotion()) return;
    if (window.Motion && typeof window.Motion.animate === 'function') {
      window.Motion.animate(
        '.hero-badge, .hero-title, .hero-statement-wrap, .hero-descriptor, .hero-actions, .hero-experience-counter, .next-up-card',
        { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] },
        { duration: 0.4, delay: window.Motion.stagger ? window.Motion.stagger(0.06) : 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      window.Motion.animate(
        '.stat-card',
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
        { duration: 0.35, delay: window.Motion.stagger ? window.Motion.stagger(0.06) : 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  }

  /**
   * Check URL hash on load (e.g. #event-evt-20260904-01)
   */
  function checkUrlHashOnLoad() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#event-')) {
      const eventId = hash.replace('#event-', '');
      setTimeout(() => openEventModal(eventId), 200);
    }
  }

  /**
   * Helpers
   */
  function getCategoryMeta(catId) {
    const categories = calendarData.categories || [];
    return categories.find(c => c.id === catId) || {
      name: 'Event',
      color: '#102A43',
      bg: '#EEF2F6',
      border: '#102A43',
      icon: 'calendar'
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Global namespace export for modal triggers
  window.AptaraPulse = {
    openModal: openEventModal,
    closeModal: closeModal
  };

})();
