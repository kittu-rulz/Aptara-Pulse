/**
 * Aptara Pulse Employee Calendar - Core Interactive Controller
 * Version: 2.1.0 (with Motion One & Micro-Animations)
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
   * DOM Ready Initializer
   */
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initLucideIcons();
    initHeroData();
    initStatsCards();
    initFeaturedEvents();
    initCarouselControls();
    initSearchEngine();
    initCategoryFilters();
    initUpcomingToggle();
    initClearFiltersAction();
    initCalendarView();
    initAgendaList();
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
   * Sticky Header Scroll Shadow
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
   * Populate Hero Text & Metadata
   */
  function initHeroData() {
    const org = calendarData.organization || {};
    const heroTitle = document.getElementById('hero-title');
    const heroMonth = document.getElementById('hero-month-badge');
    const heroMessage = document.getElementById('hero-message');

    if (heroTitle && org.portalTitle) heroTitle.textContent = org.portalTitle;
    if (heroMonth && org.monthLabel) heroMonth.textContent = org.monthLabel;
    if (heroMessage && org.monthlyMessage) heroMessage.textContent = org.monthlyMessage;
  }

  /**
   * Motion One: Gentle Hero Content Entrance & Staggered Reveal
   */
  function initEntranceAnimations() {
    if (prefersReducedMotion()) return;

    // Use Motion One if available
    if (window.Motion && typeof window.Motion.animate === 'function') {
      // 1. Hero Content Staggered Entrance
      window.Motion.animate(
        '.hero-badge, .hero-title, .hero-message, .hero-actions',
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
        { duration: 0.38, delay: window.Motion.stagger ? window.Motion.stagger(0.06) : 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );

      // 2. Staggered Reveal of Statistic Cards
      window.Motion.animate(
        '.stat-card',
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
        { duration: 0.35, delay: window.Motion.stagger ? window.Motion.stagger(0.07) : 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    }
  }

  /**
   * Initialize "At a Glance" Statistics Cards with Count-Up Effect
   */
  function initStatsCards() {
    const events = calendarData.events || [];
    const totalCount = events.length;
    const trainingCount = events.filter(e => e.category === 'training').length;
    const engagementCount = events.filter(e => e.category === 'engagement').length;
    const wellnessCount = events.filter(e => e.category === 'wellness').length;

    const totalEl = document.getElementById('stat-val-total');
    const trainingEl = document.getElementById('stat-val-training');
    const engagementEl = document.getElementById('stat-val-engagement');
    const wellnessEl = document.getElementById('stat-val-wellness');

    if (totalEl) animateCountUp(totalEl, totalCount);
    if (trainingEl) animateCountUp(trainingEl, trainingCount);
    if (engagementEl) animateCountUp(engagementEl, engagementCount);
    if (wellnessEl) animateCountUp(wellnessEl, wellnessCount);

    // Stat cards trigger category filters
    document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
      card.addEventListener('click', () => {
        const filterCat = card.dataset.filter;
        if (filterCat === 'all') {
          selectedCategories = new Set(['all']);
        } else {
          selectedCategories = new Set([filterCat]);
        }
        updateFilterPillsUI();
        triggerFilterIndicator();
        updateViews();
        const calSection = document.getElementById('calendar');
        if (calSection) calSection.scrollIntoView({ behavior: 'smooth' });
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /**
   * Count-up Animation for Numeric Statistics
   */
  function animateCountUp(element, targetValue, duration = 380) {
    if (!element) return;
    if (prefersReducedMotion() || targetValue === 0) {
      element.textContent = targetValue;
      return;
    }

    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.round(start + (targetValue - start) * easedProgress);

      element.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = targetValue;
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Subtle Progress Indicator while Filtering
   */
  function triggerFilterIndicator() {
    const bar = document.getElementById('filter-progress-bar');
    if (!bar || prefersReducedMotion()) return;

    bar.classList.remove('is-loading');
    void bar.offsetWidth; // Force reflow
    bar.classList.add('is-loading');

    setTimeout(() => {
      bar.classList.remove('is-loading');
    }, 240);
  }

  /**
   * Render Featured Event Cards ("Highlights" Section)
   */
  function initFeaturedEvents() {
    const container = document.getElementById('featured-cards-grid');
    if (!container) return;

    const featuredList = (calendarData.events || []).filter(e => e.featured);
    container.innerHTML = '';

    if (featuredList.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-secondary); padding: 1.5rem 0;">No featured events for this period.</p>';
      return;
    }

    featuredList.forEach(evt => {
      const cat = getCategory(evt.category);
      const card = document.createElement('article');
      card.className = 'event-card';
      card.tabIndex = 0;
      card.style.setProperty('--card-accent', cat.border || '#145DA0');

      const dateFormatted = formatEventTime(evt.start, evt.end, evt.allDay);

      card.innerHTML = `
        <div>
          <div class="card-top">
            <span class="category-tag" style="--cat-bg: ${cat.bg}; --cat-color: ${cat.color};">
              <i data-lucide="${cat.icon || 'tag'}" style="width: 13px; height: 13px;"></i>
              ${cat.name}
            </span>
            <span class="mode-pill">
              <i data-lucide="${getModeIcon(evt.mode)}" style="width: 12px; height: 12px;"></i>
              ${escapeHtml(evt.mode || 'Session')}
            </span>
          </div>
          <h3 class="card-title">${escapeHtml(evt.title)}</h3>
          <div class="card-meta-list">
            <div class="card-meta-item">
              <i data-lucide="clock"></i>
              <span>${dateFormatted}</span>
            </div>
            ${evt.location ? `
              <div class="card-meta-item">
                <i data-lucide="map-pin"></i>
                <span>${escapeHtml(evt.location)}</span>
              </div>
            ` : ''}
            ${evt.instructor ? `
              <div class="card-meta-item">
                <i data-lucide="user"></i>
                <span>${escapeHtml(evt.instructor)}</span>
              </div>
            ` : ''}
          </div>
          <p class="card-desc">${escapeHtml(evt.description || '')}</p>
        </div>
        <div class="card-footer">
          <button class="btn-card-action btn-card-outline" data-action="view-details" data-id="${evt.id}" aria-label="View details for ${escapeHtml(evt.title)}">
            <i data-lucide="info" style="width: 14px; height: 14px;"></i>
            Details
          </button>
          ${evt.joinUrl ? `
            <a href="${evt.joinUrl}" target="_blank" rel="noopener" class="btn-card-action btn-card-primary" aria-label="Join session for ${escapeHtml(evt.title)}">
              <i data-lucide="video" style="width: 14px; height: 14px;"></i>
              Join Session
            </a>
          ` : (evt.registrationUrl ? `
            <a href="${evt.registrationUrl}" target="_blank" rel="noopener" class="btn-card-action btn-card-primary" aria-label="Register for ${escapeHtml(evt.title)}">
              <i data-lucide="clipboard-check" style="width: 14px; height: 14px;"></i>
              Register
            </a>
          ` : `
            <button class="btn-card-action btn-card-primary" data-action="view-details" data-id="${evt.id}" aria-label="Learn more about ${escapeHtml(evt.title)}">
              <i data-lucide="calendar-plus" style="width: 14px; height: 14px;"></i>
              Learn More
            </button>
          `)}
        </div>
      `;

      container.appendChild(card);
    });

    // Attach click handlers
    container.querySelectorAll('[data-action="view-details"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        lastFocusedElement = btn;
        const eventId = btn.dataset.id;
        const targetEvent = calendarData.events.find(ev => ev.id === eventId);
        if (targetEvent) showEventModal(targetEvent);
      });
    });

    initLucideIcons();
  }

  /**
   * Mobile Featured Carousel Controls
   */
  function initCarouselControls() {
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const grid = document.getElementById('featured-cards-grid');

    if (prevBtn && grid) {
      prevBtn.addEventListener('click', () => {
        grid.scrollBy({ left: -grid.clientWidth * 0.85, behavior: 'smooth' });
      });
    }

    if (nextBtn && grid) {
      nextBtn.addEventListener('click', () => {
        grid.scrollBy({ left: grid.clientWidth * 0.85, behavior: 'smooth' });
      });
    }
  }

  /**
   * Initialize Fuse.js Search Engine
   */
  function initSearchEngine() {
    if (typeof Fuse !== 'undefined') {
      fuseInstance = new Fuse(calendarData.events || [], {
        keys: ['title', 'description', 'instructor', 'audience', 'tags', 'location'],
        threshold: 0.35,
        ignoreLocation: true
      });
    }

    const searchInput = document.getElementById('event-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        triggerFilterIndicator();
        updateViews();
      });
    }
  }

  /**
   * Multi-Category Filter Chips Stack
   */
  function initCategoryFilters() {
    const container = document.getElementById('category-filters-container');
    if (!container) return;

    container.innerHTML = '';

    // "All Categories" chip
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `
      <span style="display: flex; align-items: center; gap: 0.5rem;">
        <i data-lucide="grid" style="width: 14px; height: 14px; color: var(--color-blue);"></i>
        All Categories
      </span>
      <span class="filter-badge">${calendarData.events.length}</span>
    `;
    allBtn.addEventListener('click', () => toggleCategory('all'));
    container.appendChild(allBtn);

    // Specific Categories
    calendarData.categories.forEach(cat => {
      const count = (calendarData.events || []).filter(e => e.category === cat.id).length;
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat.id;
      btn.innerHTML = `
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="width: 9px; height: 9px; border-radius: 50%; background: ${cat.border || cat.color};"></span>
          ${cat.name}
        </span>
        <span class="filter-badge">${count}</span>
      `;
      btn.addEventListener('click', () => toggleCategory(cat.id));
      container.appendChild(btn);
    });

    initLucideIcons();
  }

  /**
   * Toggle a Category in the Multi-Select Set
   */
  function toggleCategory(categoryId) {
    if (categoryId === 'all') {
      selectedCategories = new Set(['all']);
    } else {
      if (selectedCategories.has('all')) {
        selectedCategories.delete('all');
      }

      if (selectedCategories.has(categoryId)) {
        selectedCategories.delete(categoryId);
      } else {
        selectedCategories.add(categoryId);
      }

      // If nothing selected, revert to 'all'
      if (selectedCategories.size === 0) {
        selectedCategories.add('all');
      }
    }

    triggerFilterIndicator();
    updateFilterPillsUI();
    updateViews();
  }

  /**
   * Update UI Active States for Filter Chips
   */
  function updateFilterPillsUI() {
    const isAll = selectedCategories.has('all');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const cat = btn.dataset.category;
      if (isAll && cat === 'all') {
        btn.classList.add('active');
      } else if (!isAll && selectedCategories.has(cat)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle Clear All Filters button visibility
    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn) {
      const hasActiveFilters = !isAll || isUpcomingOnly || searchQuery.length > 0;
      clearBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }
  }

  /**
   * Initialize "Upcoming Only" Filter Toggle
   */
  function initUpcomingToggle() {
    const toggleBtn = document.getElementById('toggle-upcoming-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      isUpcomingOnly = !isUpcomingOnly;
      toggleBtn.classList.toggle('active', isUpcomingOnly);
      toggleBtn.setAttribute('aria-pressed', isUpcomingOnly ? 'true' : 'false');
      triggerFilterIndicator();
      updateFilterPillsUI();
      updateViews();
    });
  }

  /**
   * Initialize "Clear All Filters" Action
   */
  function initClearFiltersAction() {
    const clearBtn = document.getElementById('btn-clear-filters');
    const emptyResetBtn = document.getElementById('btn-empty-reset');

    const resetAll = () => {
      selectedCategories = new Set(['all']);
      isUpcomingOnly = false;
      searchQuery = '';

      const searchInput = document.getElementById('event-search-input');
      if (searchInput) searchInput.value = '';

      const toggleUpcoming = document.getElementById('toggle-upcoming-btn');
      if (toggleUpcoming) {
        toggleUpcoming.classList.remove('active');
        toggleUpcoming.setAttribute('aria-pressed', 'false');
      }

      triggerFilterIndicator();
      updateFilterPillsUI();
      updateViews();
      showToast('All filters have been reset.');
    };

    if (clearBtn) clearBtn.addEventListener('click', resetAll);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAll);
  }

  /**
   * Filter Events Pipeline
   */
  function getFilteredEvents() {
    let list = calendarData.events || [];

    // 1. Search Query with Fuse.js
    if (searchQuery && fuseInstance) {
      list = fuseInstance.search(searchQuery).map(res => res.item);
    }

    // 2. Multi-Category Filtering
    if (!selectedCategories.has('all')) {
      list = list.filter(e => selectedCategories.has(e.category));
    }

    // 3. Upcoming-Only Filtering
    if (isUpcomingOnly) {
      const now = new Date('2026-09-08T00:00:00Z'); // Current mid-month reference anchor
      list = list.filter(e => new Date(e.end || e.start) >= now);
    }

    return list;
  }

  /**
   * Synchronize Calendar and Agenda Views with Smooth Fade
   */
  function updateViews() {
    const filtered = getFilteredEvents();
    const emptyStateEl = document.getElementById('calendar-empty-state');
    const calendarMount = document.getElementById('fullcalendar-mount');

    if (filtered.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = 'flex';
      if (calendarMount) calendarMount.style.display = 'none';
    } else {
      if (emptyStateEl) emptyStateEl.style.display = 'none';
      if (calendarMount) {
        calendarMount.style.display = 'block';
        if (!prefersReducedMotion() && window.Motion && typeof window.Motion.animate === 'function') {
          window.Motion.animate(calendarMount, { opacity: [0.8, 1] }, { duration: 0.2 });
        }
      }
    }

    // Update FullCalendar
    if (calendarInstance) {
      calendarInstance.removeAllEvents();
      const fcEvents = filtered.map(evt => {
        const cat = getCategory(evt.category);
        return {
          id: evt.id,
          title: evt.title,
          start: evt.start,
          end: evt.end,
          allDay: evt.allDay,
          backgroundColor: cat.bg || '#EDF5FC',
          borderColor: cat.border || '#145DA0',
          textColor: cat.color || '#145DA0',
          extendedProps: evt
        };
      });
      calendarInstance.addEventSource(fcEvents);
    }

    // Update Agenda List
    renderAgendaList(filtered);
    initLucideIcons();
  }

  /**
   * Initialize FullCalendar Component with Month and List Views
   */
  function initCalendarView() {
    const calendarEl = document.getElementById('fullcalendar-mount');
    if (!calendarEl || typeof FullCalendar === 'undefined') return;

    calendarInstance = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      initialDate: '2026-09-01',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      buttonText: {
        today: 'Today',
        dayGridMonth: 'Month',
        listMonth: 'List'
      },
      events: getFilteredEvents().map(evt => {
        const cat = getCategory(evt.category);
        return {
          id: evt.id,
          title: evt.title,
          start: evt.start,
          end: evt.end,
          allDay: evt.allDay,
          backgroundColor: cat.bg || '#EDF5FC',
          borderColor: cat.border || '#145DA0',
          textColor: cat.color || '#145DA0',
          extendedProps: evt
        };
      }),
      eventClick: function (info) {
        lastFocusedElement = info.el;
        showEventModal(info.event.extendedProps);
      },
      height: 'auto',
      dayMaxEvents: 3,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        meridiem: 'short'
      }
    });

    calendarInstance.render();
  }

  /**
   * Render Upcoming Events Agenda
   */
  function initAgendaList() {
    renderAgendaList(getFilteredEvents());
  }

  function renderAgendaList(eventsList) {
    const container = document.getElementById('agenda-items-container');
    const countEl = document.getElementById('agenda-count-badge');
    if (!container) return;

    if (countEl) countEl.textContent = `${eventsList.length} events`;
    container.innerHTML = '';

    if (eventsList.length === 0) {
      container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.85rem; padding: 1.5rem 0; text-align: center;">No matching events.</p>';
      return;
    }

    const sorted = [...eventsList].sort((a, b) => new Date(a.start) - new Date(b.start));

    sorted.forEach(evt => {
      const cat = getCategory(evt.category);
      const startDate = new Date(evt.start);
      const dayNum = startDate.getDate().toString().padStart(2, '0');
      const monthStr = startDate.toLocaleDateString('en-US', { month: 'short' });
      const timeStr = formatEventTime(evt.start, evt.end, evt.allDay);

      const item = document.createElement('button');
      item.className = 'agenda-item';
      item.setAttribute('aria-label', `View details for ${evt.title} on ${monthStr} ${dayNum}`);
      item.innerHTML = `
        <div class="agenda-date-badge" aria-hidden="true">
          <span class="agenda-date-day">${dayNum}</span>
          <span class="agenda-date-month">${monthStr}</span>
        </div>
        <div class="agenda-details">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 2px;">
            <span class="category-tag" style="--cat-bg: ${cat.bg}; --cat-color: ${cat.color}; font-size: 0.7rem; padding: 0.15rem 0.5rem;">
              ${cat.name}
            </span>
            <span style="font-size: 0.725rem; color: var(--color-text-secondary);">
              ${escapeHtml(evt.mode || 'Virtual')}
            </span>
          </div>
          <h4 class="agenda-title">${escapeHtml(evt.title)}</h4>
          <div class="agenda-meta">
            <span><i data-lucide="clock" style="width: 13px; height: 13px; display: inline; vertical-align: -2px; margin-right: 3px;"></i>${timeStr}</span>
            ${evt.location ? `<span><i data-lucide="map-pin" style="width: 13px; height: 13px; display: inline; vertical-align: -2px; margin-right: 3px;"></i>${escapeHtml(evt.location)}</span>` : ''}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        lastFocusedElement = item;
        showEventModal(evt);
      });

      container.appendChild(item);
    });

    initLucideIcons();
  }

  /**
   * Event Detail Modal Dialog with Focus Trap & Dynamic Fields
   */
  function showEventModal(evt) {
    if (!evt) return;
    activeModalEvent = evt;

    const modalOverlay = document.getElementById('event-modal-overlay');
    if (!modalOverlay) return;

    const cat = getCategory(evt.category);

    const catBadge = document.getElementById('modal-cat-badge');
    const titleEl = document.getElementById('modal-title');
    const timeEl = document.getElementById('modal-time-val');
    const rowLocation = document.getElementById('modal-row-location');
    const locationEl = document.getElementById('modal-location-val');
    const rowInstructor = document.getElementById('modal-row-instructor');
    const instructorEl = document.getElementById('modal-instructor-val');
    const rowAudience = document.getElementById('modal-row-audience');
    const audienceEl = document.getElementById('modal-audience-val');
    const descContainer = document.getElementById('modal-desc-container');
    const descEl = document.getElementById('modal-description-val');
    const tagsContainer = document.getElementById('modal-tags-container');

    // Category Badge
    if (catBadge) {
      catBadge.textContent = cat.name;
      catBadge.style.backgroundColor = cat.bg;
      catBadge.style.color = cat.color;
    }

    // Title
    if (titleEl) titleEl.textContent = evt.title;

    // Time
    if (timeEl) timeEl.textContent = formatEventTime(evt.start, evt.end, evt.allDay);

    // Location / Mode (Hide cleanly if empty)
    if (rowLocation) {
      if (evt.location) {
        rowLocation.style.display = 'flex';
        if (locationEl) locationEl.textContent = evt.location;
      } else {
        rowLocation.style.display = 'none';
      }
    }

    // Instructor / Host (Hide cleanly if empty)
    if (rowInstructor) {
      if (evt.instructor) {
        rowInstructor.style.display = 'flex';
        if (instructorEl) instructorEl.textContent = evt.instructor;
      } else {
        rowInstructor.style.display = 'none';
      }
    }

    // Target Audience (Hide cleanly if empty)
    if (rowAudience) {
      if (evt.audience) {
        rowAudience.style.display = 'flex';
        if (audienceEl) audienceEl.textContent = evt.audience;
      } else {
        rowAudience.style.display = 'none';
      }
    }

    // Description (Hide cleanly if empty)
    if (descContainer) {
      if (evt.description) {
        descContainer.style.display = 'block';
        if (descEl) descEl.textContent = evt.description;
      } else {
        descContainer.style.display = 'none';
      }
    }

    // Tags
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      if (evt.tags && evt.tags.length > 0) {
        tagsContainer.style.display = 'flex';
        evt.tags.forEach(t => {
          const pill = document.createElement('span');
          pill.className = 'tag-pill';
          pill.textContent = '#' + t;
          tagsContainer.appendChild(pill);
        });
      } else {
        tagsContainer.style.display = 'none';
      }
    }

    // Action Buttons
    const joinBtn = document.getElementById('modal-btn-join-link');
    const regBtn = document.getElementById('modal-btn-reg-link');
    const icsBtn = document.getElementById('modal-btn-ics');
    const copyLinkBtn = document.getElementById('modal-btn-copy-link');

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

    if (icsBtn) {
      icsBtn.onclick = () => downloadIcsFile(evt);
    }

    if (copyLinkBtn) {
      copyLinkBtn.onclick = () => copyEventDirectLink(evt);
    }

    // Update URL hash without scrolling
    try {
      history.replaceState(null, '', '#event=' + encodeURIComponent(evt.id));
    } catch (e) {
      // Fallback
    }

    modalOverlay.classList.add('is-active');
    initLucideIcons();

    // Trigger celebration confetti ONLY for Awards, Celebrations, or Birthday/Trivia highlights
    if (isCelebrationEvent(evt)) {
      triggerTastefulConfetti();
    }

    // Trap focus inside modal
    setTimeout(() => {
      const closeBtn = document.getElementById('modal-close-button');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  /**
   * Determine if Event is a Celebration / Awards Event
   */
  function isCelebrationEvent(evt) {
    if (!evt) return false;
    const searchTarget = `${evt.title} ${evt.category} ${(evt.tags || []).join(' ')}`.toLowerCase();
    return searchTarget.includes('award') ||
           searchTarget.includes('celebrat') ||
           searchTarget.includes('birthday') ||
           searchTarget.includes('trivia') ||
           searchTarget.includes('town hall');
  }

  /**
   * Tasteful, Restrained Confetti Burst (Self-destructing, 1.2s max)
   */
  function triggerTastefulConfetti() {
    if (prefersReducedMotion()) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#145DA0', '#6B4C9A', '#F2B84B', '#E85D75', '#55EFC4'];
    const particleCount = 28;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 120,
        y: height * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 6 - 3,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    const startTime = performance.now();
    const duration = 1200;

    function render(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = elapsed / duration;

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - progress * 1.3);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (progress < 1) {
        requestAnimationFrame(render);
      } else {
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }

    requestAnimationFrame(render);
  }

  function closeModal() {
    const modalOverlay = document.getElementById('event-modal-overlay');
    if (!modalOverlay || !modalOverlay.classList.contains('is-active')) return;

    modalOverlay.classList.remove('is-active');
    activeModalEvent = null;

    // Reset URL hash cleanly
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (e) {
      // Fallback
    }

    // Restore focus to last active element
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function initModalControls() {
    const modalOverlay = document.getElementById('event-modal-overlay');
    const closeBtn = document.getElementById('modal-close-button');
    const modalContainer = document.getElementById('modal-focus-container');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Keyboard Focus Trap & Escape Key Listener
    document.addEventListener('keydown', (e) => {
      if (!modalOverlay || !modalOverlay.classList.contains('is-active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      if (e.key === 'Tab' && modalContainer) {
        const focusableElements = modalContainer.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    });
  }

  /**
   * URL Hash Deep Linking Support
   */
  function checkUrlHashOnLoad() {
    const hash = window.location.hash;
    if (!hash) return;

    let targetEventId = '';
    if (hash.startsWith('#event=')) {
      targetEventId = decodeURIComponent(hash.replace('#event=', ''));
    } else if (hash.startsWith('#evt-')) {
      targetEventId = decodeURIComponent(hash.slice(1));
    }

    if (targetEventId) {
      const target = (calendarData.events || []).find(e => e.id === targetEventId);
      if (target) {
        setTimeout(() => showEventModal(target), 200);
      }
    }

    window.addEventListener('hashchange', () => {
      const curHash = window.location.hash;
      if (curHash.startsWith('#event=')) {
        const evId = decodeURIComponent(curHash.replace('#event=', ''));
        const ev = (calendarData.events || []).find(e => e.id === evId);
        if (ev && (!activeModalEvent || activeModalEvent.id !== evId)) {
          showEventModal(ev);
        }
      } else if (!curHash && activeModalEvent) {
        closeModal();
      }
    });
  }

  /**
   * Copy Direct Event Link with Success Toast
   */
  function copyEventDirectLink(evt) {
    const url = window.location.origin + window.location.pathname + '#event=' + encodeURIComponent(evt.id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Event link copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(url);
      });
    } else {
      fallbackCopyText(url);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Event link copied to clipboard!');
    } catch (err) {
      showToast('Could not copy link.');
    }
    document.body.removeChild(textArea);
  }

  /**
   * Toast Notification with Smooth Dismissal
   */
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width: 16px; height: 16px; color: #55EFC4;"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    initLucideIcons();

    setTimeout(() => {
      toast.classList.add('toast-dismissing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 220);
    }, 2800);
  }

  /**
   * Helper: Generate & Download .ICS Calendar Invite File
   */
  function downloadIcsFile(evt) {
    const startDate = new Date(evt.start);
    let endDate;
    if (evt.end) {
      endDate = new Date(evt.end);
    } else if (evt.allDay) {
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    } else {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }

    const formatDateToICS = (d) => {
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aptara//Aptara Pulse Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${evt.id}@aptaracorp.com`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${(evt.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${evt.location || 'Virtual Meeting'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${evt.id || 'aptara-event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('.ICS calendar invite downloaded.');
  }

  /**
   * Floating Back to Top Button
   */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
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
   * Smooth Anchor Navigation
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          history.replaceState(null, '', href);
        }
      });
    });
  }

  /**
   * Keyboard Accessibility Enhancements
   */
  function initKeyboardAccessibility() {
    // Enter key triggers on event cards
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const detailBtn = card.querySelector('[data-action="view-details"]');
          if (detailBtn) detailBtn.click();
        }
      });
    });
  }

  /**
   * Helper Utilities
   */
  function getCategory(catId) {
    return (calendarData.categories || []).find(c => c.id === catId) || {
      id: catId,
      name: catId,
      color: '#145DA0',
      bg: '#EDF5FC',
      border: '#145DA0',
      icon: 'calendar'
    };
  }

  function getModeIcon(mode) {
    switch ((mode || '').toLowerCase()) {
      case 'virtual': return 'video';
      case 'hybrid': return 'globe';
      case 'in-person': return 'building';
      default: return 'calendar';
    }
  }

  function formatEventTime(startStr, endStr, allDay) {
    if (!startStr) return '';
    const start = new Date(startStr);
    if (allDay) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' (All Day)';
    }
    const datePart = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timePart = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (endStr) {
      const end = new Date(endStr);
      const endTimePart = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${datePart} • ${timePart} – ${endTimePart}`;
    }
    return `${datePart} • ${timePart}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // Expose global methods for deep linking & external scripting
  window.openEventModal = function (eventId) {
    const ev = (calendarData.events || []).find(e => e.id === eventId);
    if (ev) showEventModal(ev);
  };
  window.closeEventModal = closeModal;

})();
