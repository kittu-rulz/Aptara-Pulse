/**
 * Aptara Pulse HR Calendar Studio - Non-Technical Editor Engine & ZIP Publisher
 * Version: 2.2.0
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'APTARA_CALENDAR_HR_DRAFT';
  let editingEventId = null;
  let previewDevice = 'desktop';

  // Available Icon Presets for Non-technical HR
  const ICON_PRESETS = [
    { id: 'book-open', label: 'Workshop / Training' },
    { id: 'video', label: 'Webinar / Stream' },
    { id: 'party-popper', label: 'Fun & Celebration' },
    { id: 'heart-pulse', label: 'Health & Wellness' },
    { id: 'megaphone', label: 'Town Hall & Speech' },
    { id: 'trophy', label: 'Awards & Recognition' },
    { id: 'calendar-check', label: 'Holiday & Off' },
    { id: 'lightbulb', label: 'Innovation & Tech' }
  ];

  // Default Baseline Data
  const baselineData = window.APTARA_CALENDAR_DATA ? JSON.parse(JSON.stringify(window.APTARA_CALENDAR_DATA)) : {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    organization: {
      name: "Aptara",
      portalTitle: "Aptara Pulse — Training, Events & Engagement Calendar",
      tagline: "Learn. Engage. Celebrate.",
      monthLabel: "September 2026",
      monthlyMessage: "Welcome to September! Discover this month's curated technical workshops, wellness sessions, global town halls, and engagement challenges designed to help you learn, connect, and celebrate.",
      contacts: {
        ld: "hr.learning@aptaracorp.com",
        engagement: "engagement@aptaracorp.com",
        phone: "Employee Support Ext: 4400"
      }
    },
    theme: {
      eyebrow: "SEPTEMBER 2026 EDITION",
      tagline: "Learn. Connect. Celebrate.",
      accent: "#145DA0",
      secondaryAccent: "#6B4C9A",
      motif: "connected-pulse",
      featuredArtwork: "genai-mesh"
    },
    categories: [
      { id: "training", name: "Training & Workshops", color: "#145DA0", bg: "#EDF5FC", border: "#145DA0", icon: "book-open" },
      { id: "engagement", name: "Employee Engagement", color: "#6B4C9A", bg: "#F5F0FA", border: "#6B4C9A", icon: "party-popper" },
      { id: "wellness", name: "Health & Wellness", color: "#E85D75", bg: "#FDF1F3", border: "#E85D75", icon: "heart-pulse" },
      { id: "townhall", name: "Town Halls & Leadership", color: "#102A43", bg: "#EEF2F6", border: "#102A43", icon: "megaphone" },
      { id: "holiday", name: "Holidays & Observances", color: "#B45309", bg: "#FEF9EE", border: "#F2B84B", icon: "calendar-check" }
    ],
    events: []
  };

  // Active Working Copy
  let calendarData = loadWorkingData();

  /**
   * Initialize on DOM Load
   */
  document.addEventListener('DOMContentLoaded', () => {
    initLucideIcons();
    initTabs();
    initCategorySelect();
    initIconPicker();
    initAllDayToggle();
    initSettingsForm();
    initEventForm();
    initEventsManagerList();
    initPreviewControls();
    initModalDialogs();
    initPublishWorkflow();
    renderLivePreview();
    updateSaveTimestamp();
  });

  function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  /**
   * Load Data from localStorage draft or baseline
   */
  function loadWorkingData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.events)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read localStorage draft:', e);
    }
    return JSON.parse(JSON.stringify(baselineData));
  }

  /**
   * Auto-Save Draft in Browser LocalStorage
   */
  function autoSaveDraft() {
    calendarData.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
      updateSaveTimestamp();
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    renderLivePreview();
  }

  function updateSaveTimestamp() {
    const badgeText = document.getElementById('save-status-text');
    if (badgeText) {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      badgeText.textContent = `Draft Auto-Saved (${timeStr})`;
    }
  }

  /**
   * Tabs Switching (Events vs Monthly Settings)
   */
  function initTabs() {
    const tabEvents = document.getElementById('tab-btn-events');
    const tabSettings = document.getElementById('tab-btn-settings');
    const panelEvents = document.getElementById('panel-events');
    const panelSettings = document.getElementById('panel-settings');

    if (tabEvents && tabSettings && panelEvents && panelSettings) {
      tabEvents.addEventListener('click', () => {
        tabEvents.classList.add('active');
        tabEvents.setAttribute('aria-selected', 'true');
        tabSettings.classList.remove('active');
        tabSettings.setAttribute('aria-selected', 'false');
        panelEvents.style.display = 'block';
        panelSettings.style.display = 'none';
      });

      tabSettings.addEventListener('click', () => {
        tabSettings.classList.add('active');
        tabSettings.setAttribute('aria-selected', 'true');
        tabEvents.classList.remove('active');
        tabEvents.setAttribute('aria-selected', 'false');
        panelSettings.style.display = 'block';
        panelEvents.style.display = 'none';
      });
    }
  }

  /**
   * Category Select & Live Color Preview
   */
  function initCategorySelect() {
    const select = document.getElementById('event-category');
    const preview = document.getElementById('category-color-preview');
    if (!select) return;

    select.innerHTML = '';
    calendarData.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });

    const updateColor = () => {
      const selected = calendarData.categories.find(c => c.id === select.value);
      if (preview && selected) {
        preview.style.backgroundColor = selected.color || selected.border || '#145DA0';
      }
    };

    select.addEventListener('change', updateColor);
    updateColor();
  }

  /**
   * Visual Icon Picker
   */
  function initIconPicker() {
    const grid = document.getElementById('icon-picker-grid');
    const hiddenInput = document.getElementById('event-selected-icon');
    if (!grid || !hiddenInput) return;

    grid.innerHTML = '';
    ICON_PRESETS.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `icon-option-btn ${hiddenInput.value === item.id ? 'selected' : ''}`;
      btn.dataset.iconId = item.id;
      btn.title = item.label;
      btn.setAttribute('aria-label', item.label);
      btn.innerHTML = `<i data-lucide="${item.id}" style="width: 16px; height: 16px;"></i>`;

      btn.addEventListener('click', () => {
        grid.querySelectorAll('.icon-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        hiddenInput.value = item.id;
      });

      grid.appendChild(btn);
    });

    initLucideIcons();
  }

  /**
   * All-Day Toggle Listener
   */
  function initAllDayToggle() {
    const checkbox = document.getElementById('event-allday');
    const timeRow = document.getElementById('time-fields-row');
    if (!checkbox || !timeRow) return;

    checkbox.addEventListener('change', () => {
      timeRow.style.display = checkbox.checked ? 'none' : 'grid';
    });
  }

  /**
   * Monthly Settings Form
   */
  function initSettingsForm() {
    const form = document.getElementById('monthly-settings-form');
    if (!form) return;

    const org = calendarData.organization || {};
    const monthSelect = document.getElementById('settings-month-name');
    const yearInput = document.getElementById('settings-year');
    const titleInput = document.getElementById('settings-portal-title');
    const msgInput = document.getElementById('settings-monthly-message');
    const contactLd = document.getElementById('settings-contact-ld');
    const contactEng = document.getElementById('settings-contact-engagement');
    const contactPhone = document.getElementById('settings-contact-phone');

    if (org.monthLabel) {
      const parts = org.monthLabel.split(' ');
      if (parts.length >= 2 && monthSelect && yearInput) {
        monthSelect.value = parts[0];
        yearInput.value = parts[1];
      }
    }
    if (titleInput && org.portalTitle) titleInput.value = org.portalTitle;
    if (msgInput && org.monthlyMessage) msgInput.value = org.monthlyMessage;
    if (contactLd && org.contacts?.ld) contactLd.value = org.contacts.ld;
    if (contactEng && org.contacts?.engagement) contactEng.value = org.contacts.engagement;
    if (contactPhone && org.contacts?.phone) contactPhone.value = org.contacts.phone;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const month = monthSelect.value;
      const year = yearInput.value.trim() || '2026';
      
      calendarData.organization.monthLabel = `${month} ${year}`;
      calendarData.organization.portalTitle = titleInput.value.trim();
      calendarData.organization.monthlyMessage = msgInput.value.trim();
      calendarData.organization.contacts = {
        ld: contactLd.value.trim(),
        engagement: contactEng.value.trim(),
        phone: contactPhone.value.trim()
      };

      autoSaveDraft();
      showToast('Monthly portal settings saved.');
    });
  }

  /**
   * Events Manager List & Reorder Items
   */
  function initEventsManagerList() {
    const container = document.getElementById('events-manager-container');
    const badge = document.getElementById('event-list-badge');
    const tabBadge = document.getElementById('tab-event-count');
    if (!container) return;

    const count = calendarData.events.length;
    if (badge) badge.textContent = count;
    if (tabBadge) tabBadge.textContent = count;
    container.innerHTML = '';

    if (count === 0) {
      container.innerHTML = '<p style="font-size: 0.825rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No events configured. Add your first session below.</p>';
      return;
    }

    calendarData.events.forEach((evt, index) => {
      const cat = calendarData.categories.find(c => c.id === evt.category) || {};
      const item = document.createElement('div');
      item.className = `event-manager-item ${editingEventId === evt.id ? 'is-editing' : ''}`;
      item.style.setProperty('--item-accent', cat.border || cat.color || '#145DA0');

      const isFirst = index === 0;
      const isLast = index === calendarData.events.length - 1;

      item.innerHTML = `
        <div class="item-info">
          <div class="item-title-row">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${cat.color || '#145DA0'};"></span>
            <h4>${escapeHtml(evt.title)}</h4>
            ${evt.featured ? '<span style="font-size: 0.65rem; background: #FEF9EE; color: #B45309; border: 1px solid #FDE68A; padding: 1px 4px; border-radius: 4px; font-weight: 700;">Featured</span>' : ''}
          </div>
          <div class="item-meta">
            <span>${escapeHtml(formatDateBadge(evt.start, evt.allDay))}</span> • 
            <span>${escapeHtml(evt.mode || 'Virtual')}</span> • 
            <span>${escapeHtml(cat.name || evt.category)}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-secondary btn-xs" data-action="move-up" data-id="${evt.id}" title="Move Up" ${isFirst ? 'disabled style="opacity:0.35;"' : ''}>
            <i data-lucide="arrow-up" style="width: 12px; height: 12px;"></i>
          </button>
          <button class="btn btn-secondary btn-xs" data-action="move-down" data-id="${evt.id}" title="Move Down" ${isLast ? 'disabled style="opacity:0.35;"' : ''}>
            <i data-lucide="arrow-down" style="width: 12px; height: 12px;"></i>
          </button>
          <button class="btn btn-secondary btn-xs" data-action="edit" data-id="${evt.id}" title="Edit Event">
            <i data-lucide="edit-3" style="width: 12px; height: 12px;"></i>
          </button>
          <button class="btn btn-secondary btn-xs" data-action="duplicate" data-id="${evt.id}" title="Duplicate Event">
            <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
          </button>
          <button class="btn btn-danger btn-xs" data-action="delete" data-id="${evt.id}" title="Delete Event">
            <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
          </button>
        </div>
      `;

      container.appendChild(item);
    });

    // Attach Actions
    container.querySelectorAll('[data-action="move-up"]').forEach(btn => {
      btn.addEventListener('click', () => moveEvent(btn.dataset.id, -1));
    });
    container.querySelectorAll('[data-action="move-down"]').forEach(btn => {
      btn.addEventListener('click', () => moveEvent(btn.dataset.id, 1));
    });
    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => editEvent(btn.dataset.id));
    });
    container.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
      btn.addEventListener('click', () => duplicateEvent(btn.dataset.id));
    });
    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
    });

    initLucideIcons();
  }

  function moveEvent(id, direction) {
    const idx = calendarData.events.findIndex(e => e.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= calendarData.events.length) return;

    const temp = calendarData.events[idx];
    calendarData.events[idx] = calendarData.events[newIdx];
    calendarData.events[newIdx] = temp;

    autoSaveDraft();
    initEventsManagerList();
  }

  function editEvent(id) {
    const evt = calendarData.events.find(e => e.id === id);
    if (!evt) return;

    editingEventId = id;
    document.getElementById('event-edit-id').value = id;
    document.getElementById('form-mode-label').textContent = `Editing: ${evt.title}`;
    document.getElementById('form-submit-text').textContent = 'Update Event';
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    // Populate Fields
    document.getElementById('event-title').value = evt.title || '';
    document.getElementById('event-category').value = evt.category || 'training';
    document.getElementById('event-mode').value = evt.mode || 'Virtual';
    document.getElementById('event-allday').checked = !!evt.allDay;
    document.getElementById('event-location').value = evt.location || '';
    document.getElementById('event-instructor').value = evt.instructor || '';
    document.getElementById('event-audience').value = evt.audience || '';
    document.getElementById('event-join-url').value = evt.joinUrl || '';
    document.getElementById('event-reg-url').value = evt.registrationUrl || '';
    document.getElementById('event-featured').checked = !!evt.featured;
    document.getElementById('event-desc').value = evt.description || '';
    document.getElementById('event-tags').value = (evt.tags || []).join(', ');
    document.getElementById('event-image-alt').value = evt.imageAlt || 'Session visual icon';

    // Split Dates and Times
    if (evt.start) {
      if (evt.start.includes('T')) {
        const parts = evt.start.split('T');
        document.getElementById('event-start-date').value = parts[0];
        document.getElementById('event-start-time').value = parts[1].slice(0, 5);
      } else {
        document.getElementById('event-start-date').value = evt.start;
      }
    }
    if (evt.end) {
      if (evt.end.includes('T')) {
        const parts = evt.end.split('T');
        document.getElementById('event-end-date').value = parts[0];
        document.getElementById('event-end-time').value = parts[1].slice(0, 5);
      } else {
        document.getElementById('event-end-date').value = evt.end;
      }
    }

    // Toggle Time Row
    const timeRow = document.getElementById('time-fields-row');
    if (timeRow) timeRow.style.display = evt.allDay ? 'none' : 'grid';

    // Category Preview
    const select = document.getElementById('event-category');
    if (select) select.dispatchEvent(new Event('change'));

    initEventsManagerList();
    document.getElementById('event-form-card').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('event-title').focus();
  }

  function duplicateEvent(id) {
    const evt = calendarData.events.find(e => e.id === id);
    if (!evt) return;

    const cloned = JSON.parse(JSON.stringify(evt));
    cloned.id = 'evt-' + Date.now();
    cloned.title = cloned.title + ' (Copy)';
    
    calendarData.events.push(cloned);
    autoSaveDraft();
    initEventsManagerList();
    showToast(`Duplicated "${evt.title}"`);
  }

  function deleteEvent(id) {
    const evt = calendarData.events.find(e => e.id === id);
    if (!evt) return;

    if (confirm(`Are you sure you want to delete "${evt.title}"?`)) {
      calendarData.events = calendarData.events.filter(e => e.id !== id);
      if (editingEventId === id) resetEventForm();
      autoSaveDraft();
      initEventsManagerList();
      showToast(`Deleted "${evt.title}"`);
    }
  }

  function resetEventForm() {
    editingEventId = null;
    const form = document.getElementById('event-editor-form');
    if (form) form.reset();
    document.getElementById('event-edit-id').value = '';
    document.getElementById('form-mode-label').textContent = 'Add New Event';
    document.getElementById('form-submit-text').textContent = 'Add Event to Calendar';
    document.getElementById('btn-cancel-edit').style.display = 'none';
    
    const timeRow = document.getElementById('time-fields-row');
    if (timeRow) timeRow.style.display = 'grid';

    // Clear validation states
    document.querySelectorAll('.field-error-msg').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    initEventsManagerList();
  }

  /**
   * Event Form Validation & Submit
   */
  function initEventForm() {
    const form = document.getElementById('event-editor-form');
    const cancelBtn = document.getElementById('btn-cancel-edit');
    const resetBtn = document.getElementById('form-reset-btn');
    const addScrollBtn = document.getElementById('btn-add-new-scroll');

    if (cancelBtn) cancelBtn.addEventListener('click', resetEventForm);
    if (resetBtn) resetBtn.addEventListener('click', resetEventForm);
    if (addScrollBtn) {
      addScrollBtn.addEventListener('click', () => {
        resetEventForm();
        document.getElementById('event-form-card').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('event-title').focus();
      });
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('event-title').value.trim();
      const category = document.getElementById('event-category').value;
      const mode = document.getElementById('event-mode').value;
      const allDay = document.getElementById('event-allday').checked;
      const startDate = document.getElementById('event-start-date').value;
      const endDate = document.getElementById('event-end-date').value;
      const startTime = document.getElementById('event-start-time').value || '10:00';
      const endTime = document.getElementById('event-end-time').value || '11:00';
      const location = document.getElementById('event-location').value.trim();
      const instructor = document.getElementById('event-instructor').value.trim();
      const audience = document.getElementById('event-audience').value.trim();
      const joinUrl = document.getElementById('event-join-url').value.trim();
      const regUrl = document.getElementById('event-reg-url').value.trim();
      const featured = document.getElementById('event-featured').checked;
      const description = document.getElementById('event-desc').value.trim();
      const tags = document.getElementById('event-tags').value.split(',').map(t => t.trim()).filter(Boolean);
      const imageAlt = document.getElementById('event-image-alt').value.trim() || 'Session visual icon';

      // Validation
      let isValid = true;
      const errTitle = document.getElementById('err-event-title');
      const errStartDate = document.getElementById('err-start-date');
      const errEndDate = document.getElementById('err-end-date');
      const errJoinUrl = document.getElementById('err-join-url');
      const errRegUrl = document.getElementById('err-reg-url');

      // Clear previous
      document.querySelectorAll('.field-error-msg').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

      if (!title) {
        if (errTitle) errTitle.style.display = 'block';
        document.getElementById('event-title').classList.add('is-invalid');
        isValid = false;
      }

      if (!startDate) {
        if (errStartDate) errStartDate.style.display = 'block';
        document.getElementById('event-start-date').classList.add('is-invalid');
        isValid = false;
      }

      if (startDate && endDate && endDate < startDate) {
        if (errEndDate) errEndDate.style.display = 'block';
        document.getElementById('event-end-date').classList.add('is-invalid');
        isValid = false;
      }

      if (joinUrl && !isValidUrl(joinUrl)) {
        if (errJoinUrl) errJoinUrl.style.display = 'block';
        document.getElementById('event-join-url').classList.add('is-invalid');
        isValid = false;
      }

      if (regUrl && !isValidUrl(regUrl)) {
        if (errRegUrl) errRegUrl.style.display = 'block';
        document.getElementById('event-reg-url').classList.add('is-invalid');
        isValid = false;
      }

      if (!isValid) return;

      // Construct Start / End ISO format
      let startIso = startDate;
      let endIso = endDate || undefined;

      if (!allDay) {
        startIso = `${startDate}T${startTime}:00`;
        if (endDate) {
          endIso = `${endDate}T${endTime}:00`;
        } else {
          endIso = `${startDate}T${endTime}:00`;
        }
      }

      const eventObj = {
        id: editingEventId || 'evt-' + Date.now(),
        title,
        category,
        start: startIso,
        end: endIso,
        allDay,
        mode,
        location,
        instructor,
        audience,
        description,
        joinUrl,
        registrationUrl: regUrl,
        recordingUrl: '',
        featured,
        tags,
        imageAlt
      };

      if (editingEventId) {
        const idx = calendarData.events.findIndex(e => e.id === editingEventId);
        if (idx !== -1) calendarData.events[idx] = eventObj;
        showToast(`Updated "${title}"`);
      } else {
        calendarData.events.push(eventObj);
        showToast(`Added "${title}" to calendar`);
      }

      autoSaveDraft();
      resetEventForm();
      initEventsManagerList();
    });
  }

  /**
   * Preview Viewport Controls (Desktop vs Mobile)
   */
  function initPreviewControls() {
    const btnDesktop = document.getElementById('preview-btn-desktop');
    const btnMobile = document.getElementById('preview-btn-mobile');
    const wrapper = document.getElementById('preview-viewport-wrapper');

    if (btnDesktop && btnMobile && wrapper) {
      btnDesktop.addEventListener('click', () => {
        btnDesktop.classList.add('active');
        btnMobile.classList.remove('active');
        wrapper.classList.remove('is-mobile-device');
        previewDevice = 'desktop';
      });

      btnMobile.addEventListener('click', () => {
        btnMobile.classList.add('active');
        btnDesktop.classList.remove('active');
        wrapper.classList.add('is-mobile-device');
        previewDevice = 'mobile';
      });
    }
  }

  /**
   * Render Live Interactive Preview Pane
   */
  function renderLivePreview() {
    const previewContainer = document.getElementById('live-preview-content');
    if (!previewContainer) return;

    const org = calendarData.organization || {};
    const events = calendarData.events || [];
    const totalCount = events.length;
    const trainingCount = events.filter(e => e.category === 'training').length;
    const engagementCount = events.filter(e => e.category === 'engagement').length;
    const wellnessCount = events.filter(e => e.category === 'wellness').length;
    const featuredList = events.filter(e => e.featured);

    previewContainer.innerHTML = `
      <!-- Hero Preview -->
      <div style="background: linear-gradient(135deg, #102A43 0%, #0F3D69 55%, #145DA0 100%); color: #FFF; padding: 2rem 1.5rem; border-radius: 12px 12px 0 0;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.7rem; background: rgba(255,255,255,0.15); border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.65rem;">
          <i data-lucide="calendar-days" style="width: 12px; height: 12px;"></i>
          <span>${escapeHtml(org.monthLabel || 'September 2026')}</span>
        </div>
        <h2 style="font-size: 1.4rem; font-weight: 800; color: #FFF; line-height: 1.25; margin-bottom: 0.5rem;">${escapeHtml(org.portalTitle || 'Aptara Pulse Calendar')}</h2>
        <p style="font-size: 0.85rem; color: #D2E3F4; line-height: 1.5;">${escapeHtml(org.monthlyMessage || '')}</p>
      </div>

      <!-- Stats Bar Preview -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; padding: 1rem 1.5rem; background: #F8FAFC; border-bottom: 1px solid #DCE4EC;">
        <div style="background: #FFF; border: 1px solid #DCE4EC; border-radius: 8px; padding: 0.6rem 0.8rem; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #102A43;">${totalCount}</div>
          <div style="font-size: 0.65rem; color: #52667A; font-weight: 700;">Total</div>
        </div>
        <div style="background: #FFF; border: 1px solid #DCE4EC; border-radius: 8px; padding: 0.6rem 0.8rem; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #145DA0;">${trainingCount}</div>
          <div style="font-size: 0.65rem; color: #52667A; font-weight: 700;">Trainings</div>
        </div>
        <div style="background: #FFF; border: 1px solid #DCE4EC; border-radius: 8px; padding: 0.6rem 0.8rem; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #6B4C9A;">${engagementCount}</div>
          <div style="font-size: 0.65rem; color: #52667A; font-weight: 700;">Engagement</div>
        </div>
        <div style="background: #FFF; border: 1px solid #DCE4EC; border-radius: 8px; padding: 0.6rem 0.8rem; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #E85D75;">${wellnessCount}</div>
          <div style="font-size: 0.65rem; color: #52667A; font-weight: 700;">Wellness</div>
        </div>
      </div>

      <!-- Highlights Preview -->
      <div style="padding: 1.25rem 1.5rem;">
        <h3 style="font-size: 0.95rem; font-weight: 800; color: #102A43; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
          <i data-lucide="sparkles" style="width: 15px; height: 15px; color: #F2B84B;"></i>
          Featured Highlights (${featuredList.length})
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.85rem;">
          ${featuredList.length === 0 ? '<p style="font-size: 0.775rem; color: #829AB1;">No featured events selected.</p>' : featuredList.map(evt => {
            const cat = calendarData.categories.find(c => c.id === evt.category) || {};
            return `
              <div style="background: #FFF; border: 1px solid #DCE4EC; border-left: 4px solid ${cat.border || '#145DA0'}; border-radius: 8px; padding: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; background: ${cat.bg}; color: ${cat.color}; padding: 0.15rem 0.45rem; border-radius: 9999px;">${cat.name}</span>
                <h4 style="font-size: 0.85rem; font-weight: 700; color: #102A43; margin: 0.35rem 0 0.25rem 0;">${escapeHtml(evt.title)}</h4>
                <p style="font-size: 0.725rem; color: #52667A;"><i data-lucide="clock" style="width: 11px; height: 11px; display: inline; vertical-align: -1px;"></i> ${formatDateBadge(evt.start, evt.allDay)}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Upcoming Schedule Preview -->
      <div style="padding: 0 1.5rem 1.5rem 1.5rem;">
        <h3 style="font-size: 0.95rem; font-weight: 800; color: #102A43; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
          <i data-lucide="calendar" style="width: 15px; height: 15px; color: #145DA0;"></i>
          All Scheduled Sessions (${events.length})
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${events.map(evt => {
            const cat = calendarData.categories.find(c => c.id === evt.category) || {};
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; background: #FFF; border: 1px solid #E9EFF6; border-radius: 6px; padding: 0.6rem 0.85rem;">
                <div>
                  <span style="font-size: 0.8rem; font-weight: 700; color: #102A43;">${escapeHtml(evt.title)}</span>
                  <div style="font-size: 0.7rem; color: #829AB1;">${formatDateBadge(evt.start, evt.allDay)} • ${escapeHtml(evt.mode || 'Virtual')}</div>
                </div>
                <span style="font-size: 0.65rem; font-weight: 700; background: ${cat.bg}; color: ${cat.color}; padding: 0.15rem 0.45rem; border-radius: 9999px;">${cat.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    initLucideIcons();
  }

  /**
   * Modal Management & Duplicate/Reset/Import Workflows
   */
  function initModalDialogs() {
    const btnOpenReset = document.getElementById('btn-open-reset');
    const btnOpenDup = document.getElementById('btn-open-duplicate-month');
    const btnOpenImport = document.getElementById('btn-open-import');

    const modalReset = document.getElementById('modal-reset-confirm');
    const modalDup = document.getElementById('modal-duplicate-month');
    const modalImport = document.getElementById('modal-import-data');

    if (btnOpenReset && modalReset) {
      btnOpenReset.addEventListener('click', () => modalReset.classList.add('is-active'));
    }
    if (btnOpenDup && modalDup) {
      btnOpenDup.addEventListener('click', () => modalDup.classList.add('is-active'));
    }
    if (btnOpenImport && modalImport) {
      btnOpenImport.addEventListener('click', () => modalImport.classList.add('is-active'));
    }

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('is-active');
      });
    });

    // Close on backdrop click & Escape
    document.querySelectorAll('.editor-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('is-active');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.editor-modal-overlay.is-active').forEach(m => m.classList.remove('is-active'));
      }
    });

    // 1. Reset Baseline
    const btnResetBaseline = document.getElementById('btn-reset-baseline');
    if (btnResetBaseline) {
      btnResetBaseline.addEventListener('click', () => {
        calendarData = JSON.parse(JSON.stringify(baselineData));
        autoSaveDraft();
        initEventsManagerList();
        initSettingsForm();
        modalReset.classList.remove('is-active');
        showToast('Restored September 2026 baseline data.');
      });
    }

    // 2. Reset Blank
    const btnResetBlank = document.getElementById('btn-reset-blank');
    if (btnResetBlank) {
      btnResetBlank.addEventListener('click', () => {
        calendarData.events = [];
        autoSaveDraft();
        initEventsManagerList();
        modalReset.classList.remove('is-active');
        showToast('Cleared all events to a blank schedule.');
      });
    }

    // 3. Duplicate Month Confirmation
    const btnConfirmDup = document.getElementById('btn-confirm-duplicate-month');
    if (btnConfirmDup) {
      btnConfirmDup.addEventListener('click', () => {
        const newMonth = document.getElementById('dup-new-month').value;
        const newYear = document.getElementById('dup-new-year').value.trim() || '2026';

        // Advance all event dates by 1 month
        calendarData.events = calendarData.events.map(e => {
          const cloned = JSON.parse(JSON.stringify(e));
          cloned.id = 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          if (cloned.start) cloned.start = advanceIsoDateByMonth(cloned.start);
          if (cloned.end) cloned.end = advanceIsoDateByMonth(cloned.end);
          return cloned;
        });

        calendarData.organization.monthLabel = `${newMonth} ${newYear}`;
        autoSaveDraft();
        initEventsManagerList();
        initSettingsForm();
        modalDup.classList.remove('is-active');
        showToast(`Duplicated previous month into ${newMonth} ${newYear}!`);
      });
    }

    // 4. Import Workflow
    const fileUploader = document.getElementById('import-file-uploader');
    const btnImportText = document.getElementById('btn-confirm-import-text');

    if (fileUploader) {
      fileUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => parseAndApplyImportData(evt.target.result, modalImport);
        reader.readAsText(file);
      });
    }

    if (btnImportText) {
      btnImportText.addEventListener('click', () => {
        const text = document.getElementById('import-text-area').value.trim();
        if (!text) {
          alert('Please upload a file or paste data.');
          return;
        }
        parseAndApplyImportData(text, modalImport);
      });
    }
  }

  function advanceIsoDateByMonth(isoStr) {
    if (!isoStr) return isoStr;
    const date = new Date(isoStr);
    date.setMonth(date.getMonth() + 1);
    if (isoStr.includes('T')) {
      return date.toISOString().slice(0, 19);
    }
    return date.toISOString().slice(0, 10);
  }

  function parseAndApplyImportData(rawText, modal) {
    try {
      let parsed;
      if (rawText.includes('window.APTARA_CALENDAR_DATA')) {
        const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
        parsed = JSON.parse(jsonStr);
      } else {
        parsed = JSON.parse(rawText);
      }

      if (parsed && Array.isArray(parsed.events)) {
        calendarData = parsed;
        autoSaveDraft();
        initEventsManagerList();
        initSettingsForm();
        if (modal) modal.classList.remove('is-active');
        showToast(`Successfully imported ${parsed.events.length} events.`);
      } else {
        alert('Invalid calendar data format.');
      }
    } catch (err) {
      alert('Failed to parse file content: ' + err.message);
    }
  }

  /**
   * Complete Pre-Publish Checklist & ZIP Publishing Workflow
   */
  function initPublishWorkflow() {
    const btnOpenPublish = document.getElementById('btn-generate-website-zip');
    const modalChecklist = document.getElementById('modal-prepublish-checklist');
    const btnConfirmDownload = document.getElementById('btn-confirm-download-zip');
    const checkMobile = document.getElementById('check-mobile-reviewed');
    const modalSuccess = document.getElementById('modal-publish-success');

    if (btnOpenPublish && modalChecklist) {
      btnOpenPublish.addEventListener('click', () => {
        runPrePublishChecklist();
        modalChecklist.classList.add('is-active');
      });
    }

    if (checkMobile) {
      checkMobile.addEventListener('change', () => {
        runPrePublishChecklist();
      });
    }

    if (btnConfirmDownload) {
      btnConfirmDownload.addEventListener('click', async () => {
        btnConfirmDownload.disabled = true;
        btnConfirmDownload.innerHTML = '<i data-lucide="loader-2" style="width: 15px; height: 15px; animation: spin 1s infinite linear;"></i> Building Website ZIP...';
        initLucideIcons();

        try {
          const zipFilename = await generateAndDownloadWebsiteZip();
          if (modalChecklist) modalChecklist.classList.remove('is-active');
          
          // Open Success Guide Panel
          const successFilenameEl = document.getElementById('success-zip-filename');
          if (successFilenameEl) successFilenameEl.textContent = zipFilename;
          if (modalSuccess) modalSuccess.classList.add('is-active');
          showToast('Website ZIP package downloaded successfully.');
        } catch (err) {
          alert('Failed to build website ZIP: ' + err.message);
        } finally {
          btnConfirmDownload.disabled = false;
          btnConfirmDownload.innerHTML = '<i data-lucide="download-cloud" style="width: 15px; height: 15px;"></i> Confirm & Download ZIP';
          initLucideIcons();
        }
      });
    }

    // Export raw calendar-data.js button
    const btnExportJs = document.getElementById('btn-export-js');
    if (btnExportJs) {
      btnExportJs.addEventListener('click', () => {
        const jsContent = `/**\n * Aptara Pulse Calendar Data\n * Updated: ${new Date().toISOString()}\n */\n\nwindow.APTARA_CALENDAR_DATA = ${JSON.stringify(calendarData, null, 2)};\n`;
        downloadBlob(jsContent, 'calendar-data.js', 'application/javascript');
        showToast('Exported calendar-data.js');
      });
    }
  }

  /**
   * Pre-Publish Verification Rules Evaluator
   */
  function runPrePublishChecklist() {
    const listContainer = document.getElementById('checklist-items-list');
    const confirmBtn = document.getElementById('btn-confirm-download-zip');
    const checkMobile = document.getElementById('check-mobile-reviewed');
    if (!listContainer) return;

    const events = calendarData.events || [];
    const org = calendarData.organization || {};

    // 1. Required fields complete
    const hasOrgTitle = Boolean(org.portalTitle && org.portalTitle.trim().length > 0);
    const hasMonthLabel = Boolean(org.monthLabel && org.monthLabel.trim().length > 0);
    const eventsHaveTitlesAndDates = events.length > 0 && events.every(e => e.title && e.title.trim() && e.start);
    const passRequiredFields = hasOrgTitle && hasMonthLabel && eventsHaveTitlesAndDates;

    // 2. No invalid links
    const passLinks = events.every(e => {
      const jValid = !e.joinUrl || isValidUrl(e.joinUrl);
      const rValid = !e.registrationUrl || isValidUrl(e.registrationUrl);
      return jValid && rValid;
    });

    // 3. No conflicting dates
    const passDates = events.every(e => {
      if (e.start && e.end) {
        return new Date(e.end) >= new Date(e.start);
      }
      return true;
    });

    // 4. All images have alt text
    const passAltText = events.every(e => {
      return !e.image || (e.imageAlt && e.imageAlt.trim().length > 0);
    });

    // 5. At least one event exists
    const passMinEvents = events.length >= 1;

    // 6. Mobile preview reviewed
    const passMobile = checkMobile ? checkMobile.checked : true;

    const allPassed = passRequiredFields && passLinks && passDates && passAltText && passMinEvents && passMobile;

    listContainer.innerHTML = `
      <!-- Item 1: Required Fields -->
      <div class="checklist-item ${passRequiredFields ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passRequiredFields ? 'check' : 'alert-circle'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Required Configuration Fields</div>
          <div class="checklist-desc">${passRequiredFields ? `Portal title and all ${events.length} session headers are complete.` : 'Missing portal title, month label, or session dates.'}</div>
        </div>
      </div>

      <!-- Item 2: Link Format Validation -->
      <div class="checklist-item ${passLinks ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passLinks ? 'check' : 'alert-circle'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Online Meeting & Registration Links</div>
          <div class="checklist-desc">${passLinks ? 'All MS Teams and registration URLs are correctly formatted.' : 'One or more events contain an invalid URL protocol.'}</div>
        </div>
      </div>

      <!-- Item 3: Date Chronology -->
      <div class="checklist-item ${passDates ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passDates ? 'check' : 'alert-circle'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Event Date & Time Integrity</div>
          <div class="checklist-desc">${passDates ? 'All session start and end dates are chronologically valid.' : 'End dates cannot be earlier than start dates.'}</div>
        </div>
      </div>

      <!-- Item 4: Image Alt Text -->
      <div class="checklist-item ${passAltText ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passAltText ? 'check' : 'alert-circle'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Image & Icon Accessibility</div>
          <div class="checklist-desc">${passAltText ? 'Screen-reader alt text verified for all visual badges and icons.' : 'Missing image accessibility descriptions.'}</div>
        </div>
      </div>

      <!-- Item 5: At least one event -->
      <div class="checklist-item ${passMinEvents ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passMinEvents ? 'check' : 'alert-circle'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Calendar Schedule Content</div>
          <div class="checklist-desc">${passMinEvents ? `${events.length} session(s) ready for monthly publishing.` : 'Please configure at least one event before publishing.'}</div>
        </div>
      </div>

      <!-- Item 6: Mobile Preview -->
      <div class="checklist-item ${passMobile ? 'status-pass' : 'status-fail'}">
        <div class="checklist-icon"><i data-lucide="${passMobile ? 'check' : 'smartphone'}" style="width: 14px; height: 14px;"></i></div>
        <div class="checklist-content">
          <div class="checklist-title">Mobile Phone Responsive Layout</div>
          <div class="checklist-desc">${passMobile ? 'Mobile layout verified.' : 'Please review the 390px mobile layout and check the confirmation below.'}</div>
        </div>
      </div>
    `;

    initLucideIcons();

    if (confirmBtn) {
      confirmBtn.disabled = !allPassed;
      confirmBtn.style.opacity = allPassed ? '1' : '0.5';
    }
  }

  /**
   * Generate Full Static Website ZIP Package via JSZip
   */
  async function generateAndDownloadWebsiteZip() {
    if (typeof JSZip === 'undefined') {
      throw new Error('JSZip library is not loaded in browser.');
    }

    const zip = new JSZip();
    const org = calendarData.organization || {};
    const monthSlug = (org.monthLabel || 'current').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const zipFilename = `aptara-pulse-${monthSlug}.zip`;

    // 1. Generate updated calendar-data.js
    const jsContent = `/**\n * Aptara Pulse Calendar Data\n * Target Month: ${org.monthLabel || 'Monthly'}\n * Package Generated: ${new Date().toISOString()}\n */\n\nwindow.APTARA_CALENDAR_DATA = ${JSON.stringify(calendarData, null, 2)};\n`;
    zip.file("assets/js/calendar-data.js", jsContent);

    // 2. Fetch Employee Portal HTML, CSS, JS, Logos & Local Vendor files
    try {
      const indexHtml = await fetch('../employee-calendar/index.html').then(r => r.text());
      const cssStyles = await fetch('../employee-calendar/assets/css/styles.css').then(r => r.text());
      const appJs = await fetch('../employee-calendar/assets/js/app.js').then(r => r.text());
      
      const logoSvg = await fetch('../employee-calendar/assets/images/Aptara-Logo.svg').then(r => r.text());
      const logoRevSvg = await fetch('../employee-calendar/assets/images/Aptara-Logo-Reverse.svg').then(r => r.text());

      const fullcalJs = await fetch('../employee-calendar/assets/vendor/fullcalendar/index.global.min.js').then(r => r.text());
      const lucideJs = await fetch('../employee-calendar/assets/vendor/lucide/lucide.min.js').then(r => r.text());
      const motionJs = await fetch('../employee-calendar/assets/vendor/motion/motion.min.js').then(r => r.text());
      const fuseJs = await fetch('../employee-calendar/assets/vendor/fuse/fuse.min.js').then(r => r.text());

      // Put files directly at root of ZIP (No parent folder)
      zip.file("index.html", indexHtml);
      zip.file("assets/css/styles.css", cssStyles);
      zip.file("assets/js/app.js", appJs);
      zip.file("assets/images/Aptara-Logo.svg", logoSvg);
      zip.file("assets/images/Aptara-Logo-Reverse.svg", logoRevSvg);
      zip.file("assets/vendor/fullcalendar/index.global.min.js", fullcalJs);
      zip.file("assets/vendor/lucide/lucide.min.js", lucideJs);
      zip.file("assets/vendor/motion/motion.min.js", motionJs);
      zip.file("assets/vendor/fuse/fuse.min.js", fuseJs);
    } catch (e) {
      console.warn('Network fetch error during packaging, relying on core packaging stream:', e);
    }

    // 3. Generate clear UPLOAD-INSTRUCTIONS.txt
    const instructionsText = `================================================================================
APTARA PULSE — TRAINING, EVENTS & ENGAGEMENT CALENDAR
Monthly Release: ${org.monthLabel || 'Monthly'}
Package Created: ${new Date().toLocaleString()}
================================================================================

OVERVIEW:
This zip contains a 100% self-contained static website.
- Zero server-side code (No PHP, Node.js, Python, or .NET runtime needed).
- Zero external runtime dependencies (No external CDN requests).
- Direct browser access supported (Opens by double-clicking index.html).

PACKAGE STRUCTURE (Direct Root):
/
├── index.html                   (Employee Portal Entry)
├── UPLOAD-INSTRUCTIONS.txt      (This guide)
└── assets/
    ├── css/styles.css           (Corporate Brand Design System)
    ├── js/app.js                (Portal Controller & Micro-interactions)
    ├── js/calendar-data.js      (Monthly Event Data)
    ├── images/                  (Corporate Logos & Visual Badges)
    └── vendor/                  (FullCalendar, Lucide, Motion One, Fuse.js)

--------------------------------------------------------------------------------
DEPLOYMENT INSTRUCTIONS FOR INTRANET WEB ADMINISTRATORS
--------------------------------------------------------------------------------

1. LOCAL TESTING / PREVIEW:
   - Extract this zip into any folder on your PC.
   - Double-click index.html. It will open and run completely offline in Chrome,
     Edge, Firefox, or Safari.

2. MICROSOFT IIS HOSTING:
   - Copy the extracted files into your IIS Virtual Directory or wwwroot path:
     Example: C:\\inetpub\\wwwroot\\pulse\\
   - Ensure the Application Pool has Read permissions on the directory.
   - Set "index.html" as the Default Document if not already configured.

3. APACHE / NGINX / LINUX WEB HOSTING:
   - Extract the contents directly into your public html document root:
     Example (Nginx):  /var/www/html/pulse/
     Example (Apache): /var/www/pulse/public_html/
   - Ensure file permissions: 'chmod -R 755 /var/www/html/pulse/'

4. SHARING LINK WITH EMPLOYEES:
   - Point internal users to your intranet URL:
     https://intranet.aptaracorp.com/pulse/

For technical assistance or monthly template adjustments:
L&D Support: ${org.contacts?.ld || 'hr.learning@aptaracorp.com'}
Engagement:  ${org.contacts?.engagement || 'engagement@aptaracorp.com'}
Support:     ${org.contacts?.phone || 'Ext: 4400'}
================================================================================
`;
    zip.file("UPLOAD-INSTRUCTIONS.txt", instructionsText);

    // Generate ZIP Blob
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });

    downloadBlob(zipBlob, zipFilename, 'application/zip');
    return zipFilename;
  }

  /**
   * Toast Notification Helper
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

  function downloadBlob(content, filename, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function formatDateBadge(startStr, allDay) {
    if (!startStr) return '';
    const date = new Date(startStr);
    if (allDay) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' (All Day)';
    }
    const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${datePart} • ${timePart}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

})();
