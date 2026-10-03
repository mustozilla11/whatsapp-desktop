(function() {
    console.log("[WA Desktop] Kilit modülü başlatılıyor...");

    async function sha256(str) {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function createOverlay() {
        if (document.getElementById('wa-desktop-lock-root')) return;

        const style = document.createElement('style');
        style.id = 'wa-desktop-lock-style';
        style.textContent = `
            #wa-desktop-lock-root {
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                background-color: #111b21;
                color: #e9edef;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                user-select: none;
            }
            .wa-lock-card {
                background: #202c33;
                padding: 40px 32px;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 320px;
                max-width: 90vw;
                text-align: center;
            }
            .wa-lock-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            .wa-lock-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #e9edef;
            }
            .wa-lock-desc {
                font-size: 13px;
                color: #8696a0;
                margin-bottom: 24px;
                line-height: 1.4;
            }
            .wa-lock-input {
                width: 100%;
                background: #111b21;
                border: 1px solid #2a3942;
                border-radius: 8px;
                padding: 12px 16px;
                font-size: 18px;
                color: #e9edef;
                text-align: center;
                letter-spacing: 4px;
                outline: none;
                margin-bottom: 12px;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            .wa-lock-input:focus {
                border-color: #00a884;
            }
            .wa-lock-btn {
                width: 100%;
                background: #00a884;
                color: #111b21;
                font-weight: 600;
                font-size: 15px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
                margin-top: 6px;
            }
            .wa-lock-btn:hover {
                background: #06cf9c;
            }
            .wa-lock-error {
                color: #f15c6d;
                font-size: 12px;
                margin-top: 8px;
                min-height: 16px;
            }
            .wa-lock-sublink {
                color: #53bdeb;
                font-size: 12px;
                margin-top: 18px;
                cursor: pointer;
                text-decoration: underline;
            }
            @keyframes wa-shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-8px); }
                40%, 80% { transform: translateX(8px); }
            }
            .wa-shake-anim {
                animation: wa-shake 0.3s ease-in-out;
            }
        `;
        document.documentElement.appendChild(style);

        const root = document.createElement('div');
        root.id = 'wa-desktop-lock-root';
        root.innerHTML = `
            <div class="wa-lock-card" id="wa-lock-card">
                <div class="wa-lock-icon">🔒</div>
                <div class="wa-lock-title" id="wa-lock-title">WhatsApp Kilitli</div>
                <div class="wa-lock-desc" id="wa-lock-desc">Devam etmek için PIN kodunuzu girin.</div>
                <input type="password" id="wa-lock-input" class="wa-lock-input" maxlength="20" placeholder="••••" autocomplete="off" />
                <button type="button" id="wa-lock-btn" class="wa-lock-btn">Kilidi Aç</button>
                <div id="wa-lock-error" class="wa-lock-error"></div>
                <div id="wa-lock-sublink" class="wa-lock-sublink">PIN Değiştir / Kaldır</div>
            </div>
        `;
        document.documentElement.appendChild(root);

        const input = root.querySelector('#wa-lock-input');
        const btn = root.querySelector('#wa-lock-btn');
        const err = root.querySelector('#wa-lock-error');
        const title = root.querySelector('#wa-lock-title');
        const desc = root.querySelector('#wa-lock-desc');
        const card = root.querySelector('#wa-lock-card');
        const sublink = root.querySelector('#wa-lock-sublink');

        let mode = 'unlock'; // 'unlock', 'set_new', 'confirm_new', 'change_old', 'change_choice'
        let tempNewPin = '';

        function updateUI() {
            err.textContent = '';
            input.value = '';
            const savedHash = localStorage.getItem('wa_lock_pin_hash');

            if (!savedHash) {
                mode = 'set_new';
                title.textContent = 'PIN Belirleyin';
                desc.textContent = 'WhatsApp güvenliği için 4-6 haneli bir PIN kodu girin.';
                btn.textContent = 'İleri';
                sublink.style.display = 'none';
                input.style.display = 'block';
            } else if (mode === 'unlock') {
                title.textContent = 'WhatsApp Kilitli';
                desc.textContent = 'Devam etmek için PIN kodunuzu girin.';
                btn.textContent = 'Kilidi Aç';
                sublink.style.display = 'block';
                sublink.textContent = 'PIN Değiştir / Kaldır';
                input.style.display = 'block';
            }
            setTimeout(() => input.focus(), 60);
        }

        async function handleSubmit() {
            err.textContent = '';
            const val = input.value.trim();

            if (mode !== 'change_choice' && !val) {
                shake('Lütfen PIN kodunu girin.');
                return;
            }

            const savedHash = localStorage.getItem('wa_lock_pin_hash');

            if (mode === 'unlock') {
                const hash = await sha256(val);
                if (hash === savedHash) {
                    sessionStorage.setItem('wa_is_locked', 'false');
                    root.style.display = 'none';
                    input.value = '';
                } else {
                    shake('Hatalı PIN kodu!');
                }
            } else if (mode === 'set_new') {
                if (val.length < 4) {
                    shake('PIN en az 4 karakter olmalıdır.');
                    return;
                }
                tempNewPin = val;
                mode = 'confirm_new';
                title.textContent = 'PIN Tekrarı';
                desc.textContent = 'Belirlediğiniz PIN kodunu onaylamak için tekrar girin.';
                btn.textContent = 'Kaydet ve Kilidi Aç';
                input.value = '';
                input.focus();
            } else if (mode === 'confirm_new') {
                if (val !== tempNewPin) {
                    shake('PIN kodları eşleşmedi! Tekrar deneyin.');
                    mode = 'set_new';
                    updateUI();
                    return;
                }
                const hash = await sha256(val);
                localStorage.setItem('wa_lock_pin_hash', hash);
                sessionStorage.setItem('wa_is_locked', 'false');
                root.style.display = 'none';
                input.value = '';
                tempNewPin = '';
            } else if (mode === 'change_old') {
                const hash = await sha256(val);
                if (hash === savedHash) {
                    mode = 'change_choice';
                    title.textContent = 'PIN Yönetimi';
                    desc.textContent = 'PIN kodunu değiştirmek mi yoksa kilidi tamamen kaldırmak mı istiyorsunuz?';
                    btn.textContent = 'Yeni PIN Belirle';
                    sublink.style.display = 'block';
                    sublink.textContent = 'Kilidi Tamamen Kaldır';
                    input.style.display = 'none';
                } else {
                    shake('Mevcut PIN hatalı!');
                }
            }
        }

        function shake(msg) {
            err.textContent = msg;
            card.classList.remove('wa-shake-anim');
            void card.offsetWidth;
            card.classList.add('wa-shake-anim');
            input.focus();
        }

        btn.addEventListener('click', () => {
            if (mode === 'change_choice') {
                input.style.display = 'block';
                mode = 'set_new';
                updateUI();
                return;
            }
            handleSubmit();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        sublink.addEventListener('click', () => {
            if (mode === 'change_choice') {
                localStorage.removeItem('wa_lock_pin_hash');
                sessionStorage.setItem('wa_is_locked', 'false');
                root.style.display = 'none';
                return;
            }
            mode = 'change_old';
            input.style.display = 'block';
            title.textContent = 'Mevcut PIN';
            desc.textContent = 'Değiştirmek veya kaldırmak için lütfen mevcut PIN kodunuzu girin.';
            btn.textContent = 'Doğrula';
            sublink.style.display = 'none';
            input.value = '';
            input.focus();
        });

        window.__waLock = function() {
            sessionStorage.setItem('wa_is_locked', 'true');
            mode = 'unlock';
            updateUI();
            root.style.display = 'flex';
        };

        window.__waChangePin = function() {
            root.style.display = 'flex';
            const savedHash = localStorage.getItem('wa_lock_pin_hash');
            if (savedHash) {
                mode = 'change_old';
                input.style.display = 'block';
                title.textContent = 'Mevcut PIN';
                desc.textContent = 'PIN değiştirmek için mevcut PIN kodunuzu girin.';
                btn.textContent = 'Doğrula';
                sublink.style.display = 'none';
                input.value = '';
                input.focus();
            } else {
                mode = 'set_new';
                updateUI();
            }
        };

        const isLocked = sessionStorage.getItem('wa_is_locked');
        const hasHash = localStorage.getItem('wa_lock_pin_hash');
        if (hasHash && isLocked !== 'false') {
            root.style.display = 'flex';
            updateUI();
        } else {
            root.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createOverlay);
    } else {
        createOverlay();
    }
})();
