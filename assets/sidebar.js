(function () {
	'use strict';

	const BOOTSTRAP_SELECTOR = '#right-admin-sidebar-bootstrap';
	const ID = 'ds-right-admin-sidebar';
	const BODY_CLASS = 'ds-has-right-admin-sidebar';
	const BODY_COLLAPSED_CLASS = 'ds-sidebar-collapsed';
	const SHIFTED_CLASS = 'ds-shifted-root';

	let currentRoot = null; // the element currently receiving the right padding

	function computeAdminBarHeight() {
		var bar = document.getElementById('wpadminbar');
		if (!bar) return 0;
		return bar.offsetHeight || 0;
	}

	function ensureCSSVars() {
		var root = document.documentElement;
		var width = (window.RightAdminSidebarConfig && RightAdminSidebarConfig.sidebarWidth) || 360;
		root.style.setProperty('--ds-sidebar-width', width + 'px');

		function setBarHeight() {
			var h = computeAdminBarHeight();
			root.style.setProperty('--ds-adminbar-height', h + 'px');
		}
		setBarHeight();
		window.addEventListener('resize', setBarHeight, { passive: true });
	}

	/**
	 * Try multiple candidates that cover:
	 * - Post/block editor
	 * - Site editor (grid-based)
	 * - Classic admin screens
	 */
	function pickLayoutRoot() {
		const candidates = [
			// Prefer outer layout containers so the grid width actually shrinks
			'.edit-site-layout',
			'.edit-site',
			'.interface-interface-skeleton',
			'.edit-post-layout',
			'#wpwrap',
			'body',
			'#site-editor',
		];

		for (const sel of candidates) {
			const el = document.querySelector(sel);
			if (el) return el;
		}
		return document.body;
	}

	function applyShift() {
		const nextRoot = pickLayoutRoot();
		if (currentRoot === nextRoot) {
			// ensure class is present (SPA nav sometimes drops it)
			if (nextRoot && !nextRoot.classList.contains(SHIFTED_CLASS)) {
				nextRoot.classList.add(SHIFTED_CLASS);
			}
			return;
		}

		// remove class from old root
		if (currentRoot) {
			currentRoot.classList.remove(SHIFTED_CLASS);
		}

		// add to new root
		if (nextRoot) {
			nextRoot.classList.add(SHIFTED_CLASS);
		}
		currentRoot = nextRoot;
	}

	function buildSidebar() {
		if (document.getElementById(ID)) return;

		var el = document.createElement('aside');
		el.id = ID;
		el.setAttribute('role', 'complementary');
		el.setAttribute('aria-label', 'Right Admin Sidebar');

		el.innerHTML = [
			'<div class="ds-sidebar-handle" title="Toggle sidebar" aria-label="Toggle sidebar">≡</div>',
			'<div class="ds-sidebar-header">Sidebar</div>',
			'<div class="ds-sidebar-content">',
			'  <p>This is scaffolding. Drop your assistant UI here.</p>',
			'</div>',
		].join('');

		document.body.appendChild(el);
		document.body.classList.add(BODY_CLASS);

		applyShift(); // initial application

		// Toggle collapse/expand
		el.querySelector('.ds-sidebar-handle').addEventListener('click', function () {
			var collapsed = el.getAttribute('data-collapsed') === 'true';
			el.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
			document.body.classList.toggle(BODY_COLLAPSED_CLASS, !collapsed);

			// When collapsed, remove shift; when expanded, (re)apply shift
			if (!collapsed) {
				if (currentRoot) currentRoot.classList.remove(SHIFTED_CLASS);
			} else {
				applyShift();
			}
		});

		// Observe SPA route/view changes to re-select the correct root in editors.
		const reapplyObserver = new MutationObserver(() => {
			// If the current root detached from DOM or we navigated to a different shell,
			// re-pick and (re)apply the shift class.
			if (!document.body.contains(currentRoot)) {
				applyShift();
			}
		});
		reapplyObserver.observe(document.body, { childList: true, subtree: true });
	}

	function bootstrap() {
		ensureCSSVars();
		buildSidebar();
	}

	function startWhenReady() {
		var ran = false;
		function runOnce() {
			if (ran) return;
			ran = true;
			bootstrap();
		}

		if (document.querySelector(BOOTSTRAP_SELECTOR)) {
			runOnce();
			return;
		}

		var obs = new MutationObserver(function () {
			if (document.querySelector(BOOTSTRAP_SELECTOR)) {
				runOnce();
				obs.disconnect();
			}
		});
		obs.observe(document.documentElement, { childList: true, subtree: true });

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', runOnce, { once: true });
		} else {
			runOnce();
		}
	}

	startWhenReady();
})();
