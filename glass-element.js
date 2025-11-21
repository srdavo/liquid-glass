/**
 * Web Component GlassElement
 * Efecto de cristal líquido usando filtros SVG
 * 
 * Funciona mejor en navegadores basados en Chromium.
 * Incluye fallback automático con blur simple para otros navegadores.
 */

class GlassElement extends HTMLElement {
    constructor() {
        super();
        this.clicked = false;
        this.attachShadow({ mode: 'open' });
        
        // Detectar soporte de filtros SVG en backdrop-filter (solo una vez por clase)
        if (GlassElement._svgFilterSupport === undefined) {
            GlassElement._svgFilterSupport = this.detectSVGFilterSupport();
            console.log(`[GlassElement] SVG Filter Support: ${GlassElement._svgFilterSupport ? '✅ YES' : '❌ NO'} (${navigator.userAgent.match(/(chrome|firefox|safari|edg)/i)?.[0] || 'unknown'})`);
        }
    }

    /**
     * Detecta si el navegador soporta filtros SVG en backdrop-filter
     */
    detectSVGFilterSupport() {
        // Primero verificar si backdrop-filter está soportado
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';
        
        if (!testElement.style.backdropFilter) {
            return false;
        }

        // Detectar navegador específicamente
        const userAgent = navigator.userAgent.toLowerCase();
        const isChrome = /chrome|chromium|crios|edg/.test(userAgent) && !/firefox|fxios/.test(userAgent);
        const isFirefox = /firefox|fxios/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|chromium|crios|edg/.test(userAgent);
        
        // Solo Chromium-based soportan filtros SVG en backdrop-filter
        // Firefox y Safari NO los soportan (al menos hasta 2025)
        if (isChrome) {
            return true;
        }
        
        if (isFirefox || isSafari) {
            return false;
        }
        
        // Para otros navegadores, intentar detección
        try {
            testElement.style.backdropFilter = 'url(#test)';
            return testElement.style.backdropFilter.includes('url');
        } catch (e) {
            return false;
        }
    }

    /**
     * Getter para saber si el navegador soporta filtros SVG
     */
    get hasSVGFilterSupport() {
        return GlassElement._svgFilterSupport;
    }

    static get observedAttributes() {
        return [
            'width', 
            'height', 
            'radius', 
            'depth', 
            'blur', 
            'strength', 
            'chromatic-aberration', 
            'debug',
            'background-color',
            'responsive',
            'base-width',
            'base-height',
            'auto-size',
            'min-width',
            'min-height'
        ];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.setupResponsive();
        
        // Observer para auto-size
        if (this.autoSize) {
            this.setupAutoSizeObserver();
        }
    }

    setupAutoSizeObserver() {
        // Observer para cambios en el contenido
        const observer = new MutationObserver(() => {
            // Pequeño delay para que el contenido se renderice
            setTimeout(() => this.updateStyles(), 0);
        });
        
        observer.observe(this, { 
            childList: true, 
            subtree: true, 
            characterData: true 
        });

        // ResizeObserver para cambios de tamaño
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.updateStyles();
            });
            resizeObserver.observe(this.shadowRoot.querySelector('.glass-box'));
        }
    }

    setupResponsive() {
        // Configurar responsive si está habilitado
        if (this.hasAttribute('responsive')) {
            this.updateResponsiveSize();
            window.addEventListener('resize', () => this.updateResponsiveSize());
        }
    }

    updateResponsiveSize() {
        const baseWidth = parseInt(this.getAttribute('base-width') || this.getAttribute('width')) || 200;
        const baseHeight = parseInt(this.getAttribute('base-height') || this.getAttribute('height')) || 200;
        
        const viewport = window.innerWidth;
        let scale = 1;
        
        if (viewport < 480) {
            scale = 0.6; // Móvil pequeño
        } else if (viewport < 768) {
            scale = 0.8; // Móvil/Tablet
        } else if (viewport < 1024) {
            scale = 0.9; // Tablet
        }
        
        const newWidth = Math.round(baseWidth * scale);
        const newHeight = Math.round(baseHeight * scale);
        
        // Solo actualizar si cambió el tamaño
        if (newWidth !== this.width || newHeight !== this.height) {
            this.setAttribute('width', newWidth);
            this.setAttribute('height', newHeight);
        }
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render();
        }
    }

    // Getters para los atributos con valores por defecto
    get width() {
        return parseInt(this.getAttribute('width')) || 200;
    }

    get height() {
        return parseInt(this.getAttribute('height')) || 200;
    }

    get radius() {
        return parseInt(this.getAttribute('radius')) || 50;
    }

    get baseDepth() {
        return parseInt(this.getAttribute('depth')) || 10;
    }

    get blur() {
        return parseInt(this.getAttribute('blur')) || 2;
    }

    get strength() {
        return parseInt(this.getAttribute('strength')) || 100;
    }

    get chromaticAberration() {
        return parseInt(this.getAttribute('chromatic-aberration')) || 0;
    }

    get debug() {
        return this.getAttribute('debug') === 'true';
    }

    get backgroundColor() {
        return this.getAttribute('background-color') || 'rgba(255, 255, 255, 0.4)';
    }

    get autoSize() {
        return this.hasAttribute('auto-size');
    }

    get minWidth() {
        return parseInt(this.getAttribute('min-width')) || 0;
    }

    get minHeight() {
        return parseInt(this.getAttribute('min-height')) || 0;
    }

    // Calcular la profundidad dinámica basada en el estado de click
    get depth() {
        return this.baseDepth / (this.clicked ? 0.7 : 1);
    }

    setupEventListeners() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        
        glassBox.addEventListener('mousedown', () => {
            this.clicked = true;
            this.updateStyles();
        });

        glassBox.addEventListener('mouseup', () => {
            this.clicked = false;
            this.updateStyles();
        });

        glassBox.addEventListener('mouseleave', () => {
            this.clicked = false;
            this.updateStyles();
        });

        // Prevenir que el evento mouseup se pierda
        document.addEventListener('mouseup', () => {
            if (this.clicked) {
                this.clicked = false;
                this.updateStyles();
            }
        });
    }

    updateStyles() {
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        if (glassBox) {
            this.applyDynamicStyles(glassBox);
        }
    }

    applyDynamicStyles(element) {
        const { getDisplacementFilter, getDisplacementMap } = window.DisplacementUtils;

        // Estilos base que siempre se aplican
        element.style.borderRadius = `${this.radius}px`;

        if (this.autoSize) {
            // Auto-size: obtener dimensiones del contenido de manera más precisa
            
            // Primero, asegurar que no hay filtros interfiriendo
            element.style.backdropFilter = 'none';
            element.style.background = 'rgba(255, 255, 255, 0.4)';
            
            // Forzar múltiples reflows para asegurar medición correcta
            element.offsetWidth;
            element.offsetHeight;
            
            // Obtener dimensiones usando múltiples métodos para mayor precisión
            const rect = element.getBoundingClientRect();
            
            // Usar el método más confiable: getBoundingClientRect
            let actualWidth = Math.ceil(rect.width);
            let actualHeight = Math.ceil(rect.height);
            
            // Si las dimensiones son 0, esperar al siguiente frame
            if (actualWidth === 0 || actualHeight === 0) {
                requestAnimationFrame(() => this.updateStyles());
                return;
            }
            
            // Aplicar tamaños mínimos si están especificados
            actualWidth = Math.max(actualWidth, this.minWidth);
            actualHeight = Math.max(actualHeight, this.minHeight);
            
            // Asegurar tamaños mínimos razonables para el filtro SVG
            actualWidth = Math.max(actualWidth, 50);
            actualHeight = Math.max(actualHeight, 30);

            if (this.debug) {
                element.style.background = `url("${getDisplacementMap({
                    height: actualHeight,
                    width: actualWidth,
                    radius: this.radius,
                    depth: this.depth
                })}")`;
                element.style.boxShadow = "none";
                element.style.backdropFilter = "none";
            } else if (!this.hasSVGFilterSupport) {
                // Fallback para navegadores sin soporte
                element.style.backdropFilter = `blur(${this.blur * 2}px)`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)';
                element.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            } else {
                // Efecto completo con SVG filters
                element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
                    height: actualHeight,
                    width: actualWidth,
                    radius: this.radius,
                    depth: this.depth,
                    strength: this.strength,
                    chromaticAberration: this.chromaticAberration
                })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)';
            }
        } else {
            // Fixed size: usar dimensiones específicas
            element.style.height = `${this.height}px`;
            element.style.width = `${this.width}px`;

            if (this.debug) {
                element.style.background = `url("${getDisplacementMap({
                    height: this.height,
                    width: this.width,
                    radius: this.radius,
                    depth: this.depth
                })}")`;
                element.style.boxShadow = "none";
                element.style.backdropFilter = "none";
            } else if (!this.hasSVGFilterSupport) {
                // Fallback para navegadores sin soporte
                element.style.backdropFilter = `blur(${this.blur * 2}px)`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)';
                element.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            } else {
                // Efecto completo con SVG filters
                element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
                    height: this.height,
                    width: this.width,
                    radius: this.radius,
                    depth: this.depth,
                    strength: this.strength,
                    chromaticAberration: this.chromaticAberration
                })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;
                element.style.background = this.backgroundColor;
                element.style.boxShadow = '1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)';
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: ${this.autoSize ? 'inline-block' : 'block'};
                }
                
                .glass-box {
                    background: rgba(255, 255, 255, 0.4);
                    box-shadow: 1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04);
                    cursor: pointer;
                    transition: transform 0.1s ease;
                    position: relative;
                    ${this.autoSize ? `display: inline-block; width: fit-content; min-width: ${this.minWidth}px; min-height: ${this.minHeight}px;` : ''}
                }
                
                .glass-box:active {
                    transform: scale(0.98);
                }

                .content {
                    ${this.autoSize ? '' : 'width: 100%; height: 100%;'}
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    text-align: center;
                    font-family: sans-serif;
                    ${this.autoSize ? 'padding: var(--glass-padding, 16px 24px);' : ''}
                }
            </style>
            <div class="glass-box">
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        `;

        // Aplicar estilos dinámicos después del render
        const glassBox = this.shadowRoot.querySelector('.glass-box');
        
        // Si es auto-size, esperar a que el contenido se renderice completamente
        if (this.autoSize) {
            // Usar doble requestAnimationFrame para asegurar que el layout esté completo
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.applyDynamicStyles(glassBox);
                });
            });
        } else {
            this.applyDynamicStyles(glassBox);
        }
    }
}

// Registrar el Web Component
customElements.define('glass-element', GlassElement);
