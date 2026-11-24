import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from '../App';

// Enable React 19 act() environment for jsdom
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// ──────────────────────────────────────────────────────────
// Component Rendering & Full Interaction Tests
// Validates App and all child components, filters, and modals
// ──────────────────────────────────────────────────────────

function setNativeValue(element: HTMLInputElement | HTMLSelectElement, value: string) {
  const proto =
    element instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  valueSetter?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

describe('App Component & Full UI Flows', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const renderApp = () => {
    act(() => {
      root.render(React.createElement(App));
    });
  };

  it('should render all main sections without crashing', () => {
    renderApp();

    expect(container.querySelector('#main-navbar')).not.toBeNull();
    expect(container.querySelector('#home')).not.toBeNull();
    expect(container.querySelector('#car-search-section')).not.toBeNull();
    expect(container.querySelector('#cars')).not.toBeNull();
    expect(container.querySelector('#about')).not.toBeNull();
    expect(container.querySelector('#services')).not.toBeNull();
    expect(container.querySelector('#reviews')).not.toBeNull();
    expect(container.querySelector('#contact')).not.toBeNull();
    expect(container.querySelector('#footer-main')).not.toBeNull();
  });

  it('should handle Navbar scroll, desktop links, and mobile menu interactions', () => {
    renderApp();

    // Scroll down and back up
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 60, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(container.querySelector('#main-navbar')?.className).toContain('backdrop-blur-md');

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    // Click brand logo and desktop nav links
    const brandBtn = container.querySelector('#navbar-brand-button') as HTMLButtonElement;
    const carsNavBtn = container.querySelector('#nav-link-cars') as HTMLButtonElement;
    act(() => {
      brandBtn.click();
      carsNavBtn.click();
    });
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    // Open mobile menu, click mobile nav link, reopen and click mobile test drive
    const mobileToggle = container.querySelector('#mobile-menu-toggle-button') as HTMLButtonElement;
    act(() => {
      mobileToggle.click();
    });
    expect(container.querySelector('#mobile-navigation-drawer')).not.toBeNull();

    const mobileAboutLink = container.querySelector('#mobile-nav-about') as HTMLButtonElement;
    act(() => {
      mobileAboutLink.click();
    });
    expect(container.querySelector('#mobile-navigation-drawer')).toBeNull();

    act(() => {
      mobileToggle.click();
    });
    const mobileTestDrive = container.querySelector('#mobile-test-drive-button') as HTMLButtonElement;
    act(() => {
      mobileTestDrive.click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();
  });

  it('should handle Hero, PerformanceSection, and CallToAction button clicks', () => {
    renderApp();

    // Hero buttons
    act(() => {
      (container.querySelector('#hero-explore-cars-button') as HTMLButtonElement).click();
      (container.querySelector('#hero-scroll-indicator') as HTMLButtonElement).click();
      (container.querySelector('#hero-book-test-drive-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();

    // Close test drive modal
    act(() => {
      (container.querySelector('#close-test-drive-modal-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).toBeNull();

    // Performance section -> opens Porsche 911 details modal
    act(() => {
      (container.querySelector('#discover-performance-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#car-details-modal-overlay')).not.toBeNull();

    // Close car details modal
    act(() => {
      (container.querySelector('#close-car-details-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#car-details-modal-overlay')).toBeNull();

    // Call to Action buttons
    act(() => {
      (container.querySelector('#cta-browse-inventory-button') as HTMLButtonElement).click();
      (container.querySelector('#cta-book-test-drive-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();
  });

  it('should filter cars via CarSearch controls, switch FeaturedCars tabs, and handle empty state', () => {
    renderApp();

    const brandSelect = container.querySelector('#filter-brand-select') as HTMLSelectElement;
    const modelSelect = container.querySelector('#filter-model-select') as HTMLSelectElement;
    const fuelSelect = container.querySelector('#filter-fuel-select') as HTMLSelectElement;
    const transSelect = container.querySelector('#filter-transmission-select') as HTMLSelectElement;
    const priceSlider = container.querySelector('#filter-price-slider') as HTMLInputElement;
    const searchBtn = container.querySelector('#search-cars-submit-button') as HTMLButtonElement;

    // Select brand, model, fuel, transmission, price
    act(() => {
      setNativeValue(brandSelect, 'Porsche');
    });
    expect(container.querySelector('#reset-filters-button')).not.toBeNull();

    act(() => {
      setNativeValue(modelSelect, '911 Carrera S');
      setNativeValue(fuelSelect, 'Petrol');
      setNativeValue(transSelect, 'Dual-Clutch');
      setNativeValue(priceSlider, '140000');
      searchBtn.click();
    });

    // Trigger empty state with low price
    act(() => {
      setNativeValue(priceSlider, '30000');
    });
    expect(container.textContent).toContain('No Matching Vehicles Found');

    // Reset from empty state button
    const resetEmptyBtn = Array.from(container.querySelectorAll('#cars button')).find((b) =>
      b.textContent?.includes('Reset All Filters')
    ) as HTMLButtonElement;
    act(() => {
      resetEmptyBtn.click();
    });
    expect(container.textContent).not.toContain('No Matching Vehicles Found');

    // Switch FeaturedCars category tabs
    const findTab = (label: string) =>
      Array.from(container.querySelectorAll('#cars button')).find((b) =>
        b.textContent?.includes(label)
      ) as HTMLButtonElement;

    act(() => {
      findTab('Performance').click();
    });
    act(() => {
      findTab('Luxury').click();
    });
    act(() => {
      findTab('Hybrid').click();
    });
    act(() => {
      findTab('All Models').click();
    });

    // Also test CarSearch reset button
    act(() => {
      setNativeValue(brandSelect, 'BMW');
    });
    act(() => {
      (container.querySelector('#reset-filters-button') as HTMLButtonElement).click();
    });
    expect(brandSelect.value).toBe('All');
  });

  it('should open CarDetailsModal, switch gallery images, and transition to TestDriveModal', () => {
    renderApp();

    // Open details for first car
    const detailsBtn = container.querySelector('#view-details-porsche-911') as HTMLButtonElement;
    act(() => {
      detailsBtn.click();
    });
    expect(container.querySelector('#car-details-modal-overlay')).not.toBeNull();

    // Click inside modal card (stopPropagation)
    act(() => {
      (container.querySelector('#car-details-modal-card') as HTMLDivElement).click();
    });
    expect(container.querySelector('#car-details-modal-overlay')).not.toBeNull();

    // Click gallery thumbnail if present
    const galleryBtns = container.querySelectorAll('#car-details-modal-card img[alt^="View "]');
    if (galleryBtns.length > 1) {
      act(() => {
        (galleryBtns[1].closest('button') as HTMLButtonElement).click();
      });
    }

    // Click "Book Test Drive" inside CarDetailsModal
    const bookBtn = Array.from(
      container.querySelectorAll('#car-details-modal-card button')
    ).find((b) => b.textContent?.includes('Book Test Drive')) as HTMLButtonElement;
    act(() => {
      bookBtn.click();
    });
    expect(container.querySelector('#car-details-modal-overlay')).toBeNull();
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();

    // Close TestDriveModal and test card-level test drive button
    act(() => {
      (container.querySelector('#close-test-drive-modal-button') as HTMLButtonElement).click();
    });
    act(() => {
      (container.querySelector('#card-test-drive-porsche-911') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();
  });

  it('should validate and submit the TestDriveModal booking form', () => {
    vi.useFakeTimers();
    renderApp();

    // Open via desktop navbar button
    act(() => {
      (container.querySelector('#nav-book-test-drive-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();

    // Click inside modal container (stopPropagation)
    act(() => {
      (container.querySelector('#test-drive-modal-container') as HTMLDivElement).click();
    });

    const form = container.querySelector('#test-drive-modal-container form') as HTMLFormElement;
    form.noValidate = true;
    const submitBtn = container.querySelector('#submit-test-drive-button') as HTMLButtonElement;

    // 1. Submit empty form -> triggers required errors
    act(() => {
      submitBtn.click();
    });
    expect(container.textContent).toContain('Full Name is required');
    expect(container.textContent).toContain('Email address is required');
    expect(container.textContent).toContain('Contact telephone number is required');
    expect(container.textContent).toContain('Please select a preferred test-drive date');
    expect(container.textContent).toContain("valid driver's license");

    // 2. Submit invalid short values -> triggers format/length errors
    const nameInput = container.querySelector('#input-full-name') as HTMLInputElement;
    const phoneInput = container.querySelector('#input-phone-number') as HTMLInputElement;
    const emailInput = container.querySelector('#input-email-address') as HTMLInputElement;
    const dateInput = container.querySelector('#input-preferred-date') as HTMLInputElement;
    const timeSelect = container.querySelector('#input-preferred-time') as HTMLSelectElement;
    const licenseCheckbox = container.querySelector('#checkbox-drivers-license') as HTMLInputElement;

    act(() => {
      setNativeValue(nameInput, 'Al');
      setNativeValue(phoneInput, '123');
      setNativeValue(emailInput, 'not-an-email');
    });
    act(() => {
      submitBtn.click();
    });
    expect(container.textContent).toContain('Please enter your full legal name');
    expect(container.textContent).toContain('Please enter a valid email address');
    expect(container.textContent).toContain('Please provide a valid phone number');

    // 3. Select a different vehicle inside the modal
    const vehicleBtns = container.querySelectorAll('#test-drive-modal-container form button[type="button"]');
    if (vehicleBtns.length > 1) {
      act(() => {
        (vehicleBtns[1] as HTMLButtonElement).click();
      });
    }

    // 4. Fill valid form data and submit
    act(() => {
      setNativeValue(nameInput, 'Alex Mercer');
      setNativeValue(phoneInput, '+1 555 123 4567');
      setNativeValue(emailInput, 'alex@motorx.test');
      setNativeValue(dateInput, '2027-05-20');
      setNativeValue(timeSelect, '02:00 PM');
      licenseCheckbox.click();
    });

    act(() => {
      submitBtn.click();
    });
    expect(container.textContent).toContain('Confirming...');

    // Advance timer for simulated booking confirmation
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.textContent).toContain('YOUR TEST DRIVE IS SCHEDULED');
    expect(container.textContent).toContain('Alex Mercer');

    // Click Return to Showroom
    act(() => {
      (container.querySelector('#done-test-drive-button') as HTMLButtonElement).click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).toBeNull();
  });

  it('should handle all Footer navigation and InfoModal actions', () => {
    renderApp();

    const footerButtons = Array.from(container.querySelectorAll('#footer-main button'));
    const findFooterBtn = (text: string) =>
      footerButtons.find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

    // Navigation links in footer
    for (const label of [
      'About Us',
      'Contact Concierge',
      'Available Fleet',
      'High Performance',
      'Executive Luxury',
      'Hybrid & Electric',
    ]) {
      act(() => {
        findFooterBtn(label).click();
      });
    }

    // Test Drive button in footer
    act(() => {
      findFooterBtn('Book a Test Drive').click();
    });
    expect(container.querySelector('#test-drive-modal-overlay')).not.toBeNull();
    act(() => {
      (container.querySelector('#close-test-drive-modal-button') as HTMLButtonElement).click();
    });

    // InfoModal links in footer
    for (const label of [
      'Heritage & Philosophy',
      'Press & Media',
      'Financing & Leasing',
      'Master Service Program',
      'Trade-In Valuation',
      'Privacy Policy',
      'Terms & Conditions',
      'Disclaimers',
    ]) {
      act(() => {
        findFooterBtn(label).click();
      });
      expect(container.querySelector('#info-modal-overlay')).not.toBeNull();

      // Click inner container (stopPropagation)
      act(() => {
        (container.querySelector('#info-modal-container') as HTMLDivElement).click();
      });
      expect(container.querySelector('#info-modal-overlay')).not.toBeNull();

      // Close via Understood button
      const understoodBtn = Array.from(
        container.querySelectorAll('#info-modal-container button')
      ).find((b) => b.textContent?.includes('Understood')) as HTMLButtonElement;
      act(() => {
        understoodBtn.click();
      });
      expect(container.querySelector('#info-modal-overlay')).toBeNull();
    }
  });
});
