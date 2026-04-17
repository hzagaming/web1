(() => {
    /* ===== DOM Elements ===== */
    const boardEl = document.getElementById('board');
    const connect4Board = document.getElementById('connect4-board');
    const c4CellsContainer = document.getElementById('c4-cells');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const statusText = document.getElementById('status-text');
    const statusBar = document.querySelector('.status-bar');
    const winLine = document.getElementById('win-line');
    const winLineSvg = winLine.querySelector('line');
    const c4WinLine = document.getElementById('c4-win-line');
    const c4WinLineSvg = c4WinLine.querySelector('line');
    const restartBtn = document.getElementById('restart-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const drawer = document.getElementById('settings-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');
    const modal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalIcon = document.getElementById('modal-icon');
    const modalBtn = document.getElementById('modal-btn');
    const scoreXEl = document.getElementById('score-x');
    const scoreOEl = document.getElementById('score-o');
    const scoreDrawEl = document.getElementById('score-draw');
    const modeSwitch = document.getElementById('mode-switch');
    const modeBtns = Array.from(document.querySelectorAll('.mode-btn'));
    const subtitle = document.getElementById('subtitle');
    const aiDifficultyGroup = document.getElementById('ai-difficulty-group');

    const animToggle = document.getElementById('toggle-animations');
    const soundToggle = document.getElementById('toggle-sound');
    const toggle3d = document.getElementById('toggle-3d');
    const contrastSlider = document.getElementById('contrast-slider');
    const contrastValue = document.getElementById('contrast-value');
    const customColorInput = document.getElementById('custom-color-input');
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchValue = document.getElementById('pitch-value');
    const durationSlider = document.getElementById('duration-slider');
    const durationValue = document.getElementById('duration-value');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    const testSoundBtn = document.getElementById('test-sound-btn');

    const changelogBtn = document.getElementById('changelog-btn');
    const changelogModal = document.getElementById('changelog-modal');
    const changelogClose = document.getElementById('changelog-close');
    const changelogBody = document.getElementById('changelog-body');

    const PLAYER_X = 'X';
    const PLAYER_O = 'O';

    /* ===== State ===== */
    let gameBoard = Array(9).fill('');
    let c4Board = Array(6).fill(null).map(() => Array(7).fill(''));
    let gameActive = true;
    let currentPlayer = PLAYER_X;
    let currentMode = 'pve';
    let scores = { X: 0, O: 0, draw: 0 };
    let aiTimer = null;
    let audioCtx = null;

    const settings = {
        lang: 'zh',
        theme: 'dark',
        accentColor: '#7b68ee',
        customColor: '#7b68ee',
        contrast: 100,
        font: 'inter',
        animations: true,
        animSpeed: 'normal',
        board3d: false,
        sound: true,
        soundStyle: 'classic',
        soundPitch: 0,
        soundDuration: 100,
        soundVolume: 80,
        difficulty: 'hard'
    };

    const langMap = {
        zh: '中文', en: 'English', ja: '日本語', ko: '한국어',
        fr: 'Français', de: 'Deutsch', es: 'Español', ru: 'Русский',
        it: 'Italiano', pt: 'Português'
    };

    const colorPresets = [
        { id: 'violet', hex: '#7b68ee' },
        { id: 'crimson', hex: '#ff4757' },
        { id: 'ocean', hex: '#3498db' },
        { id: 'emerald', hex: '#2ecc71' },
        { id: 'amber', hex: '#f39c12' },
        { id: 'rose', hex: '#e84393' },
        { id: 'lime', hex: '#a3cb38' },
        { id: 'midnight', hex: '#192a56' },
        { id: 'coral', hex: '#ff6b6b' },
        { id: 'cyan', hex: '#00cec9' },
    ];

    const i18n = buildI18n();

    function buildI18n() {
        const c = {
            'subtitle-pve': { zh:'不可战胜的 AI 对手', en:'Unbeatable AI Opponent', ja:'無敵の AI 対戦相手', ko:'무적의 AI 상대', fr:'Adversaire IA imbattable', de:'Unbesiegbarer Gegner', es:'Oponente IA invencible', ru:'Непобедимый ИИ', it:'Avversario AI imbattibile', pt:'Oponente IA invencível' },
            'subtitle-pvp': { zh:'好友本地对战', en:'Local Two-Player Battle', ja:'ローカル対戦', ko:'로컬 2인 대전', fr:'Duel local', de:'Lokaler Zweikampf', es:'Batalla local', ru:'Локальная игра', it:'Sfida locale', pt:'Batalha local' },
            'subtitle-aivsai': { zh:'最强 AI 巅峰对决', en:'Ultimate AI Showdown', ja:'AI 頂上決戦', ko:'최강 AI 대결', fr:'Duel ultime IA', de:'Ultimativer Showdown', es:'Enfrentamiento IA', ru:'Битва ИИ', it:'Scontro finale AI', pt:'Confronto IA supremo' },
            'subtitle-connect4': { zh:'四子连珠 重力对决', en:'Connect Four Gravity Battle', ja:'四目並べ', ko:'사목 대결', fr:'Puissance 4', de:'Vier gewinnt', es:'Conecta 4', ru:'Четыре в ряд', it:'Forza 4', pt:'Ligue 4' },
            'mode-pve': { zh:'人机', en:'PvE', ja:'CPU戦', ko:'AI전', fr:'PvE', de:'PvE', es:'PvE', ru:'PvE', it:'PvE', pt:'PvE' },
            'mode-pvp': { zh:'双人', en:'PvP', ja:'対戦', ko:'2인전', fr:'PvP', de:'PvP', es:'PvP', ru:'PvP', it:'PvP', pt:'PvP' },
            'mode-aivsai': { zh:'AI 对战', en:'AI vs AI', ja:'AI対AI', ko:'AI vs AI', fr:'IA vs IA', de:'KI vs KI', es:'IA vs IA', ru:'ИИ vs ИИ', it:'AI vs AI', pt:'IA vs IA' },
            'mode-connect4': { zh:'四子棋', en:'Connect 4', ja:'四目', ko:'사목', fr:'Puissance 4', de:'Vier', es:'Conecta 4', ru:'4 в ряд', it:'Forza 4', pt:'Ligue 4' },
            'label-player-x': { zh:'玩家 (X)', en:'Player (X)', ja:'プレイヤー (X)', ko:'플레이어 (X)', fr:'Joueur (X)', de:'Spieler (X)', es:'Jugador (X)', ru:'Игрок (X)', it:'Giocatore (X)', pt:'Jogador (X)' },
            'label-player-o': { zh:'AI (O)', en:'AI (O)', ja:'AI (O)', ko:'AI (O)', fr:'IA (O)', de:'KI (O)', es:'IA (O)', ru:'ИИ (O)', it:'AI (O)', pt:'IA (O)' },
            'label-player-x-pvp': { zh:'玩家 1 (X)', en:'Player 1 (X)', ja:'プレイヤー1 (X)', ko:'플레이어 1 (X)', fr:'Joueur 1 (X)', de:'Spieler 1 (X)', es:'Jugador 1 (X)', ru:'Игрок 1 (X)', it:'Giocatore 1 (X)', pt:'Jogador 1 (X)' },
            'label-player-o-pvp': { zh:'玩家 2 (O)', en:'Player 2 (O)', ja:'プレイヤー2 (O)', ko:'플레이어 2 (O)', fr:'Joueur 2 (O)', de:'Spieler 2 (O)', es:'Jugador 2 (O)', ru:'Игрок 2 (O)', it:'Giocatore 2 (O)', pt:'Jogador 2 (O)' },
            'label-player-x-ai': { zh:'AI (X)', en:'AI (X)', ja:'AI (X)', ko:'AI (X)', fr:'IA (X)', de:'KI (X)', es:'IA (X)', ru:'ИИ (X)', it:'AI (X)', pt:'IA (X)' },
            'label-player-o-ai': { zh:'AI (O)', en:'AI (O)', ja:'AI (O)', ko:'AI (O)', fr:'IA (O)', de:'KI (O)', es:'IA (O)', ru:'ИИ (O)', it:'AI (O)', pt:'IA (O)' },
            'label-draw': { zh:'平局', en:'Draw', ja:'引き分け', ko:'무승부', fr:'Égalité', de:'Unentschieden', es:'Empate', ru:'Ничья', it:'Pareggio', pt:'Empate' },
            'status-your-turn': { zh:'你的回合', en:'Your Turn', ja:'あなたの番', ko:'당신의 턴', fr:'Votre tour', de:'Dein Zug', es:'Tu turno', ru:'Ваш ход', it:'Il tuo turno', pt:'Sua vez' },
            'status-ai-thinking': { zh:'AI 思考中...', en:'AI Thinking...', ja:'AI 思考中...', ko:'AI 생각 중...', fr:'IA réfléchit...', de:'KI denkt...', es:'IA pensando...', ru:'ИИ думает...', it:'AI sta pensando...', pt:'IA pensando...' },
            'status-player1-turn': { zh:'玩家 1 的回合', en:"Player 1's Turn", ja:'プレイヤー1の番', ko:'플레이어 1 턴', fr:'Tour J1', de:'Spieler 1', es:'Turno J1', ru:'Ход Игрока 1', it:'Turno G1', pt:'Vez J1' },
            'status-player2-turn': { zh:'玩家 2 的回合', en:"Player 2's Turn", ja:'プレイヤー2の番', ko:'플레이어 2 턴', fr:'Tour J2', de:'Spieler 2', es:'Turno J2', ru:'Ход Игрока 2', it:'Turno G2', pt:'Vez J2' },
            'status-ai-x-thinking': { zh:'AI X 思考中...', en:'AI X Thinking...', ja:'AI X 思考中...', ko:'AI X 생각 중...', fr:'IA X réfléchit...', de:'KI X denkt...', es:'IA X pensando...', ru:'ИИ X думает...', it:'AI X sta pensando...', pt:'IA X pensando...' },
            'status-ai-o-thinking': { zh:'AI O 思考中...', en:'AI O Thinking...', ja:'AI O 思考中...', ko:'AI O 생각 중...', fr:'IA O réfléchit...', de:'KI O denkt...', es:'IA O pensando...', ru:'ИИ O думает...', it:'AI O sta pensando...', pt:'IA O pensando...' },
            'status-draw': { zh:'平局', en:'Draw', ja:'引き分け', ko:'무승부', fr:'Égalité', de:'Unentschieden', es:'Empate', ru:'Ничья', it:'Pareggio', pt:'Empate' },
            'btn-restart': { zh:'再来一局', en:'Restart', ja:'リスタート', ko:'다시 시작', fr:'Rejouer', de:'Neustart', es:'Reiniciar', ru:'Заново', it:'Ricomincia', pt:'Reiniciar' },
            'btn-play-again': { zh:'再来一局', en:'Play Again', ja:'もう一度', ko:'다시 하기', fr:'Rejouer', de:'Nochmal', es:'Jugar otra vez', ru:'Играть снова', it:'Gioca ancora', pt:'Jogar de novo' },
            'modal-game-over': { zh:'游戏结束', en:'Game Over', ja:'ゲーム終了', ko:'게임 종료', fr:'Fin du jeu', de:'Spielende', es:'Juego terminado', ru:'Игра окончена', it:'Fine partita', pt:'Fim de jogo' },
            'modal-win': { zh:'恭喜获胜！', en:'Victory!', ja:'勝利！', ko:'승리!', fr:'Victoire !', de:'Sieg!', es:'¡Victoria!', ru:'Победа!', it:'Vittoria!', pt:'Vitória!' },
            'modal-ai-x-wins': { zh:'AI X 技高一筹', en:'AI X takes the win', ja:'AI X が勝利', ko:'AI X 승리', fr:'IA X gagne', de:'KI X gewinnt', es:'IA X gana', ru:'ИИ X побеждает', it:'AI X vince', pt:'IA X vence' },
            'modal-ai-o-wins': { zh:'AI O 赢得胜利', en:'AI O takes the win', ja:'AI O が勝利', ko:'AI O 승리', fr:'IA O gagne', de:'KI O gewinnt', es:'IA O gana', ru:'ИИ O побеждает', it:'AI O vince', pt:'IA O vence' },
            'modal-player1-wins': { zh:'玩家 1 大获全胜！', en:'Player 1 wins big!', ja:'プレイヤー1 圧勝！', ko:'플레이어 1 대승!', fr:'Joueur 1 gagne !', de:'Spieler 1 gewinnt!', es:'¡Jugador 1 gana!', ru:'Игрок 1 побеждает!', it:'Giocatore 1 vince!', pt:'Jogador 1 vence!' },
            'modal-player2-wins': { zh:'玩家 2 技高一筹！', en:'Player 2 is on fire!', ja:'プレイヤー2 勝利！', ko:'플레이어 2 승리!', fr:'Joueur 2 gagne !', de:'Spieler 2 gewinnt!', es:'¡Jugador 2 gana!', ru:'Игрок 2 побеждает!', it:'Giocatore 2 vince!', pt:'Jogador 2 vence!' },
            'modal-you-win': { zh:'不可思议，你击败了 AI！', en:'Incredible, you beat the AI!', ja:'AI に勝利！', ko:'AI를 이겼습니다!', fr:'Incroyable, vous battez l\'IA !', de:'Unglaublich, du besiegst die KI!', es:'¡Increíble, venciste a la IA!', ru:'Невероятно, вы победили ИИ!', it:'Incredibile, hai battuto l\'AI!', pt:'Incrível, você venceu a IA!' },
            'modal-ai-wins': { zh:'别气馁，再来一局！', en:'Don\'t give up, try again!', ja:'諦めずにもう一度！', ko:'포기 말고 다시!', fr:'Ne abandonne pas, réessaie !', de:'Gib nicht auf, versuch es nochmal!', es:'¡No te rindas, inténtalo de nuevo!', ru:'Не сдавайся, попробуй ещё!', it:'Non mollare, riprova!', pt:'Não desista, tente de novo!' },
            'modal-draw-pvp': { zh:'旗鼓相当的对手！', en:'Well matched!', ja:'互角の戦い！', ko:'실력이 비슷합니다!', fr:'Bien matchés !', de:'Gut gematcht!', es:'¡Bien emparejados!', ru:'Равная игра!', it:'Ben abbinati!', pt:'Bem equilibrado!' },
            'modal-draw-aivsai': { zh:'两大 AI 势均力敌', en:'Two perfect AIs clash', ja:'AI 同士の激突', ko:'두 AI의 대결', fr:'Deux IAs parfaites s\'affrontent', de:'Zwei perfekte KIs kollidieren', es:'Dos IAs perfectas chocan', ru:'Столкновение двух ИИ', it:'Scontro tra due AI perfette', pt:'Dois IAs perfeitos colidem' },
            'settings-title': { zh:'设置', en:'Settings', ja:'設定', ko:'설정', fr:'Paramètres', de:'Einstellungen', es:'Ajustes', ru:'Настройки', it:'Impostazioni', pt:'Configurações' },
            'setting-language': { zh:'语言', en:'Language', ja:'言語', ko:'언어', fr:'Langue', de:'Sprache', es:'Idioma', ru:'Язык', it:'Lingua', pt:'Idioma' },
            'setting-theme-color': { zh:'主题色', en:'Accent Color', ja:'アクセント色', ko:'강조 색상', fr:'Couleur', de:'Akzentfarbe', es:'Color de acento', ru:'Цвет акцента', it:'Colore', pt:'Cor de destaque' },
            'setting-custom-color': { zh:'自定义', en:'Custom', ja:'カスタム', ko:'사용자 지정', fr:'Personnalisé', de:'Benutzerdef.', es:'Personalizado', ru:'Свой', it:'Personalizzato', pt:'Personalizado' },
            'setting-contrast': { zh:'对比度', en:'Contrast', ja:'コントラスト', ko:'대비', fr:'Contraste', de:'Kontrast', es:'Contraste', ru:'Контраст', it:'Contrasto', pt:'Contraste' },
            'setting-font': { zh:'字体', en:'Font', ja:'フォント', ko:'글꼴', fr:'Police', de:'Schriftart', es:'Fuente', ru:'Шрифт', it:'Carattere', pt:'Fonte' },
            'setting-theme': { zh:'外观模式', en:'Appearance', ja:'外観モード', ko:'외관 모드', fr:'Apparence', de:'Erscheinung', es:'Apariencia', ru:'Внешний вид', it:'Aspetto', pt:'Aparência' },
            'setting-3d': { zh:'3D 棋盘', en:'3D Board', ja:'3D ボード', ko:'3D 보드', fr:'Plateau 3D', de:'3D-Brett', es:'Tablero 3D', ru:'3D доска', it:'Scacchiera 3D', pt:'Tabuleiro 3D' },
            'setting-animations': { zh:'动画效果', en:'Animations', ja:'アニメーション', ko:'애니메이션', fr:'Animations', de:'Animationen', es:'Animaciones', ru:'Анимации', it:'Animazioni', pt:'Animações' },
            'setting-anim-speed': { zh:'动画速度', en:'Anim Speed', ja:'アニメ速度', ko:'애니메이션 속도', fr:'Vitesse', de:'Geschw.', es:'Velocidad', ru:'Скорость', it:'Velocità', pt:'Velocidade' },
            'setting-sound': { zh:'音效', en:'Sound', ja:'効果音', ko:'효과음', fr:'Son', de:'Ton', es:'Sonido', ru:'Звук', it:'Audio', pt:'Som' },
            'setting-sound-style': { zh:'音效风格', en:'Sound Style', ja:'効果音スタイル', ko:'효과음 스타일', fr:'Style sonore', de:'Tonstil', es:'Estilo de sonido', ru:'Стиль звука', it:'Stile audio', pt:'Estilo de som' },
            'setting-difficulty': { zh:'AI 难度', en:'AI Difficulty', ja:'AI 難易度', ko:'AI 난이도', fr:'Difficulté IA', de:'KI-Schwierigk.', es:'Dificultad IA', ru:'Сложность ИИ', it:'Difficoltà AI', pt:'Dificuldade IA' },
            'theme-dark': { zh:'深色', en:'Dark', ja:'ダーク', ko:'다크', fr:'Sombre', de:'Dunkel', es:'Oscuro', ru:'Тёмная', it:'Scuro', pt:'Escuro' },
            'theme-light': { zh:'浅色', en:'Light', ja:'ライト', ko:'라이트', fr:'Clair', de:'Hell', es:'Claro', ru:'Светлая', it:'Chiaro', pt:'Claro' },
            'theme-auto': { zh:'自动', en:'Auto', ja:'自動', ko:'자동', fr:'Auto', de:'Auto', es:'Auto', ru:'Авто', it:'Auto', pt:'Auto' },
            'font-inter': { zh:'Inter', en:'Inter', ja:'Inter', ko:'Inter', fr:'Inter', de:'Inter', es:'Inter', ru:'Inter', it:'Inter', pt:'Inter' },
            'font-serif': { zh:'衬线', en:'Serif', ja:'明朝', ko:'세리프', fr:'Serif', de:'Serif', es:'Serif', ru:'С засечками', it:'Serif', pt:'Serif' },
            'font-mono': { zh:'等宽', en:'Mono', ja:'等幅', ko:'모노', fr:'Mono', de:'Mono', es:'Mono', ru:'Моношир.', it:'Mono', pt:'Mono' },
            'font-rounded': { zh:'圆体', en:'Rounded', ja:'丸ゴ', ko:'둥근', fr:'Arrondi', de:'Rund', es:'Redondeada', ru:'Округлый', it:'Arrotondato', pt:'Arredondada' },
            'speed-slow': { zh:'慢', en:'Slow', ja:'遅い', ko:'느림', fr:'Lent', de:'Langsam', es:'Lento', ru:'Медл.', it:'Lenta', pt:'Lento' },
            'speed-normal': { zh:'中', en:'Normal', ja:'普通', ko:'보통', fr:'Normal', de:'Normal', es:'Normal', ru:'Норм.', it:'Normale', pt:'Normal' },
            'speed-fast': { zh:'快', en:'Fast', ja:'速い', ko:'빠름', fr:'Rapide', de:'Schnell', es:'Rápido', ru:'Быстр.', it:'Veloce', pt:'Rápido' },
            'sound-classic': { zh:'经典', en:'Classic', ja:'クラシック', ko:'클식', fr:'Classique', de:'Klassisch', es:'Clásico', ru:'Классика', it:'Classico', pt:'Clássico' },
            'sound-electronic': { zh:'电子', en:'Electronic', ja:'エレクトロ', ko:'일렉트로닉', fr:'Électronique', de:'Elektronisch', es:'Electrónico', ru:'Электро', it:'Elettronico', pt:'Eletrônico' },
            'sound-retro': { zh:'复古', en:'Retro', ja:'レトロ', ko:'레트로', fr:'Rétro', de:'Retro', es:'Retro', ru:'Ретро', it:'Retrò', pt:'Retrô' },
            'sound-wood': { zh:'木琴', en:'Wood', ja:'木琴', ko:'목금', fr:'Bois', de:'Holz', es:'Madera', ru:'Ксилофон', it:'Legno', pt:'Madeira' },
            'sound-bell': { zh:'铃铛', en:'Bell', ja:'ベル', ko:'벨', fr:'Cloche', de:'Glocke', es:'Campana', ru:'Колокол', it:'Campana', pt:'Sino' },
            'sound-space': { zh:'太空', en:'Space', ja:'宇宙', ko:'우주', fr:'Espace', de:'Weltraum', es:'Espacio', ru:'Космос', it:'Spazio', pt:'Espaço' },
            'sound-drum': { zh:'鼓点', en:'Drum', ja:'ドラム', ko:'드럼', fr:'Tambour', de:'Trommel', es:'Tambor', ru:'Барабан', it:'Tamburo', pt:'Tambor' },
            'sound-piano': { zh:'钢琴', en:'Piano', ja:'ピアノ', ko:'피아노', fr:'Piano', de:'Klavier', es:'Piano', ru:'Фортепиано', it:'Pianoforte', pt:'Piano' },
            'sound-pitch': { zh:'音高', en:'Pitch', ja:'ピッチ', ko:'피치', fr:'Hauteur', de:'Tonhöhe', es:'Tono', ru:'Высота', it:'Altezza', pt:'Tom' },
            'sound-duration': { zh:'音长', en:'Duration', ja:'音長', ko:'지속', fr:'Durée', de:'Dauer', es:'Duración', ru:'Длительность', it:'Durata', pt:'Duração' },
            'sound-volume': { zh:'音量', en:'Volume', ja:'音量', ko:'볼륨', fr:'Volume', de:'Lautstärke', es:'Volumen', ru:'Громкость', it:'Volume', pt:'Volume' },
            'sound-test': { zh:'试听', en:'Test', ja:'試聴', ko:'시청', fr:'Tester', de:'Testen', es:'Probar', ru:'Тест', it:'Prova', pt:'Testar' },
            'diff-easy': { zh:'简单', en:'Easy', ja:'簡単', ko:'쉬움', fr:'Facile', de:'Einfach', es:'Fácil', ru:'Легко', it:'Facile', pt:'Fácil' },
            'diff-medium': { zh:'中等', en:'Medium', ja:'普通', ko:'보통', fr:'Moyen', de:'Mittel', es:'Medio', ru:'Средне', it:'Medio', pt:'Médio' },
            'diff-hard': { zh:'困难', en:'Hard', ja:'難しい', ko:'어려움', fr:'Difficile', de:'Schwer', es:'Difícil', ru:'Сложно', it:'Difficile', pt:'Difícil' },
            'changelog-title': { zh:'更新公告', en:'Changelog', ja:'更新履歴', ko:'업데이트 공지', fr:'Mises à jour', de:'Änderungen', es:'Actualizaciones', ru:'Обновления', it:'Aggiornamenti', pt:'Atualizações' },
        };
        const out = {};
        for (const [key, langs] of Object.entries(c)) {
            for (const [lang, text] of Object.entries(langs)) {
                if (!out[lang]) out[lang] = {};
                out[lang][key] = text;
            }
        }
        return out;
    }

    const tttWinConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const C4_ROWS = 6;
    const C4_COLS = 7;

    const xSvg = `<svg class="mark mark-x" viewBox="0 0 100 100"><path d="M25 25 L75 75 M75 25 L25 75" /></svg>`;
    const oSvg = `<svg class="mark mark-o" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" /></svg>`;

    /* ===== Changelog Data ===== */
    const changelogData = [
        {
            version: '0.2.0',
            date: { zh:'2026-04-17', en:'Apr 17, 2026', ja:'2026年4月17日', ko:'2026년 4월 17일', fr:'17 avr. 2026', de:'17. Apr. 2026', es:'17 abr. 2026', ru:'17 апр. 2026', it:'17 apr. 2026', pt:'17 de abr. de 2026' },
            items: {
                zh: ['新增四子棋（Connect Four）游戏模式', '新增 3D 棋盘视觉效果（透视旋转）', '音效系统全面升级：支持音高/音长/音量自定义调节', '新增 4 种音效风格（铃铛/太空/鼓点/钢琴）', '音效支持实时试听功能'],
                en: ['Added Connect Four game mode', 'Added 3D board visual effect (perspective rotation)', 'Upgraded sound system: customizable pitch/duration/volume', 'Added 4 sound styles (Bell/Space/Drum/Piano)', 'Added real-time sound test button'],
                ja: ['四目並べモード追加','3D ボード視覚効果追加','効果音カスタマイズ機能追加','4種類の効果音スタイル追加','効果音試聴機能追加'],
                ko: ['사목 게임 모드 추가','3D 보드 시각 효과 추가','효과음 커스터마이징 추가','4가지 효과음 스타일 추가','효과음 시청 기능 추가'],
                fr: ['Mode Puissance 4 ajouté','Effet visuel 3D ajouté','Personnalisation sonore','4 styles sonores ajoutés','Test sonore en direct'],
                de: ['Vier-gewinnt-Modus hinzugefügt','3D-Brett-Effekt hinzugefügt','Klang-Anpassung','4 Tonstile hinzugefügt','Klang-Test'],
                es: ['Modo Conecta 4 añadido','Efecto visual 3D añadido','Personalización de sonido','4 estilos de sonido añadidos','Prueba de sonido'],
                ru: ['Режим 4 в ряд','3D-эффект доски','Настройка звука','4 новых стиля звука','Тест звука'],
                it: ['Modalità Forza 4','Effetto 3D','Personalizzazione audio','4 stili audio','Test audio'],
                pt: ['Modo Ligue 4','Efeito 3D','Personalização de som','4 estilos de som','Teste de som'],
            }
        },
        {
            version: '0.1.2',
            date: { zh:'2026-04-17', en:'Apr 17, 2026', ja:'2026年4月17日', ko:'2026년 4월 17일', fr:'17 avr. 2026', de:'17. Apr. 2026', es:'17 abr. 2026', ru:'17 апр. 2026', it:'17 apr. 2026', pt:'17 de abr. de 2026' },
            items: {
                zh: ['扩展至 10 种语言支持', '新增 10 种主题色 + 自定义颜色选择器', '新增对比度调节滑块', '新增 4 种字体切换', '新增动画速度调节（慢/中/快）', '新增 4 种音效风格（经典/电子/复古/木琴）', '新增公告 / 更新日志弹窗系统'],
                en: ['Extended to 10 languages', 'Added 10 accent colors + custom color picker', 'Added contrast slider', 'Added 4 font options', 'Added animation speed control', 'Added 4 sound styles', 'Added changelog modal'],
                ja: ['10言語対応拡張','10色アクセント+カスタムカラー','コントラスト調整','4フォント切替','アニメ速度調整','4効果音スタイル','更新履歴ポップアップ'],
                ko: ['10개 언어 지원 확장','10가지 테마색 + 사용자 지정 색상','대비 조절 슬라이더','4가지 글꼴 전환','애니메이션 속도 조절','4가지 효과음 스타일','업데이트 공지 팝업'],
                fr: ['10 langues','10 couleurs + personnalisé','Curseur contraste','4 polices','Vitesse animation','4 styles sonores','Fenêtre mises à jour'],
                de: ['10 Sprachen','10 Farben + benutzerdef.','Kontrastschieber','4 Schriftarten','Animationsgeschw.','4 Tonstile','Änderungsprotokoll'],
                es: ['10 idiomas','10 colores + personalizado','Control contraste','4 fuentes','Velocidad animación','4 estilos sonido','Ventana actualizaciones'],
                ru: ['10 языков','10 цветов + свой','Ползунок контраста','4 шрифта','Скорость анимации','4 стиля звука','Окно обновлений'],
                it: ['10 lingue','10 colori + personalizzato','Cursore contrasto','4 font','Velocità animazione','4 stili audio','Finestra aggiornamenti'],
                pt: ['10 idiomas','10 cores + personalizada','Controle contraste','4 fontes','Velocidade animação','4 estilos som','Janela atualizações'],
            }
        },
        {
            version: '0.1.1',
            date: { zh:'2026-04-17', en:'Apr 17, 2026', ja:'2026年4月17日', ko:'2026년 4월 17일', fr:'17 avr. 2026', de:'17. Apr. 2026', es:'17 abr. 2026', ru:'17 апр. 2026', it:'17 apr. 2026', pt:'17 de abr. de 2026' },
            items: {
                zh: ['新增设置面板', '支持语言切换（中/英）', '支持深色 / 浅色 / 自动主题', '支持动画开关', '支持音效开关', '支持 AI 难度调节'],
                en: ['Added settings panel', 'Language switching (EN/ZH)', 'Dark/Light/Auto theme', 'Animation toggle', 'Sound toggle', 'AI difficulty'],
                ja: ['設定パネル追加','言語切替','ダーク/ライト/自動テーマ','アニメーションON/OFF','効果音ON/OFF','AI難易度'],
                ko: ['설정 패널 추가','언어 전환','다크/라이트/자동 테마','애니메이션 ON/OFF','효과음 ON/OFF','AI 난이도'],
                fr: ['Panneau paramètres','Changement langue','Thème Sombre/Clair/Auto','Animations','Son','Difficulté IA'],
                de: ['Einstellungsfenster','Sprachwechsel','Dunkel/Hell/Auto','Animationen','Ton','KI-Schwierigkeit'],
                es: ['Panel ajustes','Cambio idioma','Tema oscuro/claro/auto','Animaciones','Sonido','Dificultad IA'],
                ru: ['Панель настроек','Смена языка','Тёмная/светлая/авто','Анимации','Звук','Сложность ИИ'],
                it: ['Pannello impostazioni','Cambio lingua','Tema scuro/chiaro/auto','Animazioni','Audio','Difficoltà AI'],
                pt: ['Painel configurações','Troca idioma','Tema escuro/claro/auto','Animações','Som','Dificuldade IA'],
            }
        },
        {
            version: '0.1.0',
            date: { zh:'2026-04-17', en:'Apr 17, 2026', ja:'2026年4月17日', ko:'2026년 4월 17일', fr:'17 avr. 2026', de:'17. Apr. 2026', es:'17 abr. 2026', ru:'17 апр. 2026', it:'17 apr. 2026', pt:'17 de abr. de 2026' },
            items: {
                zh: ['新增双人对战模式', '新增 AI 对战模式', '新增胜利连线动画', '新增分数统计系统'],
                en: ['Added local PvP mode', 'Added AI vs AI mode', 'Added win line animation', 'Added score tracking'],
                ja: ['対戦モード追加','AI対戦モード追加','勝利ラインアニメ追加','スコア統計追加'],
                ko: ['2인 대전 모드 추가','AI 대전 모드 추가','승리 연결 애니메이션 추가','점수 통계 추가'],
                fr: ['Mode PvP local','Mode IA vs IA','Animation ligne victorieuse','Suivi scores'],
                de: ['Lokaler PvP-Modus','KI vs KI','Sieglinien-Animation','Punktverfolgung'],
                es: ['Modo PvP local','Modo IA vs IA','Animación línea victoriosa','Seguimiento puntos'],
                ru: ['Локальный PvP','ИИ vs ИИ','Анимация линии победы','Подсчёт очков'],
                it: ['Modalità PvP locale','Modalità AI vs AI','Animazione linea vittoria','Tracciamento punteggio'],
                pt: ['Modo PvP local','Modo IA vs IA','Animação linha vencedora','Acompanhamento pontos'],
            }
        },
        {
            version: '0.0.0',
            date: { zh:'2026-04-17', en:'Apr 17, 2026', ja:'2026年4月17日', ko:'2026년 4월 17일', fr:'17 avr. 2026', de:'17. Apr. 2026', es:'17 abr. 2026', ru:'17 апр. 2026', it:'17 apr. 2026', pt:'17 de abr. de 2026' },
            items: {
                zh: ['项目初始化', '基础井字棋功能', '人机对战（不可战胜 AI）'],
                en: ['Project initialization', 'Basic Tic-Tac-Toe', 'Player vs Unbeatable AI'],
                ja: ['プロジェクト初期化','基礎機能','プレイヤー vs 無敵AI'],
                ko: ['프로젝트 초기화','기본 기능','플레이어 vs 무적 AI'],
                fr: ['Initialisation','Tic-Tac-Toe de base','Joueur vs IA imbattable'],
                de: ['Projektinitialisierung','Basis-Tic-Tac-Toe','Spieler vs unbesiegbarer KI'],
                es: ['Inicialización','Tres en raya básico','Jugador vs IA invencible'],
                ru: ['Инициализация','Базовые крестики-нолики','Игрок vs непобедимый ИИ'],
                it: ['Inizializzazione','Tris base','Giocatore vs AI imbattibile'],
                pt: ['Inicialização','Jogo da velha básico','Jogador vs IA invencível'],
            }
        }
    ];

    /* ===== I18n Helpers ===== */
    function t(key) {
        return (i18n[settings.lang] && i18n[settings.lang][key]) || key;
    }

    function applyI18n() {
        document.documentElement.lang = settings.lang === 'zh' ? 'zh-CN' : settings.lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const tr = t(key);
            if (tr) el.textContent = tr;
        });
        updateScoreLabels();
        updateStatus(getTurnText(), currentPlayer === PLAYER_X ? 'x' : 'o');
        if (currentMode === 'pve') subtitle.textContent = t('subtitle-pve');
        else if (currentMode === 'pvp') subtitle.textContent = t('subtitle-pvp');
        else if (currentMode === 'aivsai') subtitle.textContent = t('subtitle-aivsai');
        else subtitle.textContent = t('subtitle-connect4');
        renderChangelog();
    }

    /* ===== Settings UI Builders ===== */
    function buildLangGrid() {
        const grid = document.getElementById('lang-grid');
        grid.innerHTML = '';
        Object.entries(langMap).forEach(([code, name]) => {
            const btn = document.createElement('button');
            btn.className = 'lang-btn' + (settings.lang === code ? ' active' : '');
            btn.textContent = name;
            btn.addEventListener('click', () => setLang(code));
            grid.appendChild(btn);
        });
    }

    function buildColorPicker() {
        const picker = document.getElementById('color-picker');
        picker.innerHTML = '';
        colorPresets.forEach(p => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch' + (settings.accentColor === p.hex ? ' active' : '');
            swatch.style.background = p.hex;
            swatch.addEventListener('click', () => setAccentColor(p.hex));
            picker.appendChild(swatch);
        });
    }

    /* ===== Init ===== */
    function init() {
        buildLangGrid();
        buildColorPicker();
        buildC4Cells();
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        restartBtn.addEventListener('click', resetGame);
        modalBtn.addEventListener('click', resetGame);
        modal.addEventListener('click', e => { if (e.target === modal) resetGame(); });
        modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

        settingsBtn.addEventListener('click', openDrawer);
        drawerClose.addEventListener('click', closeDrawer);
        drawerOverlay.addEventListener('click', closeDrawer);

        document.querySelectorAll('#font-segmented .seg-btn').forEach(btn =>
            btn.addEventListener('click', () => setFont(btn.dataset.font)));
        document.querySelectorAll('#theme-segmented .seg-btn').forEach(btn =>
            btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
        document.querySelectorAll('#anim-speed-segmented .seg-btn').forEach(btn =>
            btn.addEventListener('click', () => setAnimSpeed(btn.dataset.speed)));
        document.querySelectorAll('#sound-style-segmented .seg-btn').forEach(btn =>
            btn.addEventListener('click', () => setSoundStyle(btn.dataset.sound)));
        document.querySelectorAll('#difficulty-segmented .seg-btn').forEach(btn =>
            btn.addEventListener('click', () => setDifficulty(btn.dataset.diff)));

        animToggle.addEventListener('change', e => setAnimations(e.target.checked));
        soundToggle.addEventListener('change', e => setSound(e.target.checked));
        toggle3d.addEventListener('change', e => set3d(e.target.checked));
        contrastSlider.addEventListener('input', e => setContrast(e.target.value));
        customColorInput.addEventListener('input', e => setAccentColor(e.target.value, true));

        pitchSlider.addEventListener('input', e => { settings.soundPitch = parseInt(e.target.value); pitchValue.textContent = (settings.soundPitch > 0 ? '+' : '') + settings.soundPitch; });
        durationSlider.addEventListener('input', e => { settings.soundDuration = parseInt(e.target.value); durationValue.textContent = settings.soundDuration + '%'; });
        volumeSlider.addEventListener('input', e => { settings.soundVolume = parseInt(e.target.value); volumeValue.textContent = settings.soundVolume + '%'; });
        testSoundBtn.addEventListener('click', () => { initAudio(); playMoveSound(PLAYER_X); });

        changelogBtn.addEventListener('click', openChangelog);
        changelogClose.addEventListener('click', closeChangelog);
        changelogModal.addEventListener('click', e => { if (e.target === changelogModal) closeChangelog(); });

        applySettingsUI();
        applyI18n();
    }

    function buildC4Cells() {
        c4CellsContainer.innerHTML = '';
        for (let r = 0; r < C4_ROWS; r++) {
            for (let c = 0; c < C4_COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'c4-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleC4CellClick);
                c4CellsContainer.appendChild(cell);
            }
        }
    }

    /* ===== Settings Logic ===== */
    function openDrawer() { drawer.classList.add('show'); drawerOverlay.classList.add('show'); }
    function closeDrawer() { drawer.classList.remove('show'); drawerOverlay.classList.remove('show'); }

    function setLang(lang) {
        if (settings.lang === lang) return;
        settings.lang = lang;
        buildLangGrid();
        applyI18n();
    }

    function setTheme(theme) {
        if (settings.theme === theme) return;
        settings.theme = theme;
        applySettingsUI();
        document.documentElement.setAttribute('data-theme', theme);
    }

    function setAccentColor(hex, isCustom = false) {
        settings.accentColor = hex;
        if (isCustom) settings.customColor = hex;
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        document.documentElement.style.setProperty('--accent-h', hsl.h);
        document.documentElement.style.setProperty('--accent-s', hsl.s + '%');
        document.documentElement.style.setProperty('--accent-l', hsl.l + '%');
        if (!isCustom) customColorInput.value = hex;
        buildColorPicker();
    }

    function setContrast(val) {
        settings.contrast = val;
        contrastValue.textContent = val + '%';
        document.documentElement.style.setProperty('--contrast', val / 100);
    }

    function setFont(font) {
        if (settings.font === font) return;
        settings.font = font;
        applySettingsUI();
        document.body.setAttribute('data-font', font);
    }

    function setAnimations(on) {
        settings.animations = on;
        applySettingsUI();
        document.body.classList.toggle('animations-off', !on);
    }

    function setAnimSpeed(speed) {
        if (settings.animSpeed === speed) return;
        settings.animSpeed = speed;
        applySettingsUI();
        const scale = speed === 'slow' ? 1.8 : speed === 'fast' ? 0.4 : 1;
        document.documentElement.style.setProperty('--anim-scale', scale);
    }

    function setSound(on) {
        settings.sound = on;
        applySettingsUI();
        if (on) initAudio();
    }

    function setSoundStyle(style) {
        if (settings.soundStyle === style) return;
        settings.soundStyle = style;
        applySettingsUI();
    }

    function set3d(on) {
        settings.board3d = on;
        applySettingsUI();
        boardEl.classList.toggle('is-3d', on);
        connect4Board.classList.toggle('is-3d', on);
    }

    function setDifficulty(diff) {
        if (settings.difficulty === diff) return;
        settings.difficulty = diff;
        applySettingsUI();
        if (currentMode === 'pve') resetGame();
    }

    function applySettingsUI() {
        document.querySelectorAll('#font-segmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.font === settings.font));
        document.querySelectorAll('#theme-segmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
        document.querySelectorAll('#anim-speed-segmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.speed === settings.animSpeed));
        document.querySelectorAll('#sound-style-segmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.sound === settings.soundStyle));
        document.querySelectorAll('#difficulty-segmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === settings.difficulty));
        animToggle.checked = settings.animations;
        soundToggle.checked = settings.sound;
        toggle3d.checked = settings.board3d;
        contrastSlider.value = settings.contrast;
        contrastValue.textContent = settings.contrast + '%';
        customColorInput.value = settings.customColor;
        pitchSlider.value = settings.soundPitch;
        pitchValue.textContent = (settings.soundPitch > 0 ? '+' : '') + settings.soundPitch;
        durationSlider.value = settings.soundDuration;
        durationValue.textContent = settings.soundDuration + '%';
        volumeSlider.value = settings.soundVolume;
        volumeValue.textContent = settings.soundVolume + '%';
        document.documentElement.setAttribute('data-theme', settings.theme);
        document.body.setAttribute('data-font', settings.font);
        document.body.classList.toggle('animations-off', !settings.animations);
        boardEl.classList.toggle('is-3d', settings.board3d);
        connect4Board.classList.toggle('is-3d', settings.board3d);
        const scale = settings.animSpeed === 'slow' ? 1.8 : settings.animSpeed === 'fast' ? 0.4 : 1;
        document.documentElement.style.setProperty('--anim-scale', scale);
        document.documentElement.style.setProperty('--contrast', settings.contrast / 100);
        const rgb = hexToRgb(settings.accentColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        document.documentElement.style.setProperty('--accent-h', hsl.h);
        document.documentElement.style.setProperty('--accent-s', hsl.s + '%');
        document.documentElement.style.setProperty('--accent-l', hsl.l + '%');
    }

    /* ===== Color Helpers ===== */
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function freqShift(baseFreq) {
        return baseFreq * Math.pow(2, settings.soundPitch / 12);
    }

    function durMul(base) {
        return base * (settings.soundDuration / 100);
    }

    function volMul() {
        return settings.soundVolume / 100;
    }

    /* ===== Audio ===== */
    function initAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playOsc(freq, type, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration));
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playFiltered(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + durMul(duration));
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration));
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playRetro(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration) * 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playWoodTone(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration) * 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playBell(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration) * 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
        // harmonic
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freqShift(freq * 2), audioCtx.currentTime);
        gain2.gain.setValueAtTime(vol * volMul() * 0.3, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration) * 0.5);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + durMul(duration));
    }

    function playSpace(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freqShift(freq), audioCtx.currentTime);
        filter.Q.setValueAtTime(10, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol * volMul() * 0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration));
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playDrum(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freqShift(freq * 0.5), audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + durMul(duration) * 0.3);
        gain.gain.setValueAtTime(vol * volMul(), audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durMul(duration) * 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + durMul(duration));
    }

    function playPiano(freq, duration, vol) {
        if (!settings.sound || !audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        // fundamental
        playOsc(freq, 'sine', duration, vol * 0.6);
        // harmonics for piano-like richness
        setTimeout(() => playOsc(freq * 2, 'sine', duration * 0.5, vol * 0.2), 10);
        setTimeout(() => playOsc(freq * 3, 'sine', duration * 0.3, vol * 0.1), 20);
    }

    function playMoveSound(player) {
        initAudio();
        const style = settings.soundStyle;
        const baseFreq = player === PLAYER_X ? 523.25 : 392;
        const type = player === PLAYER_X ? 'sine' : 'triangle';
        if (style === 'classic') playOsc(baseFreq, type, 0.12, 0.12);
        else if (style === 'electronic') playFiltered(baseFreq, 0.15, 0.12);
        else if (style === 'retro') playRetro(baseFreq, 0.12, 0.1);
        else if (style === 'wood') playWoodTone(baseFreq, 0.18, 0.15);
        else if (style === 'bell') playBell(baseFreq, 0.25, 0.12);
        else if (style === 'space') playSpace(baseFreq, 0.2, 0.1);
        else if (style === 'drum') playDrum(baseFreq, 0.15, 0.12);
        else if (style === 'piano') playPiano(baseFreq, 0.2, 0.15);
    }

    function playWinSound() {
        initAudio();
        const style = settings.soundStyle;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        if (style === 'classic') notes.forEach((freq, i) => setTimeout(() => playOsc(freq, 'sine', 0.25, 0.1), i * 80));
        else if (style === 'electronic') notes.forEach((freq, i) => setTimeout(() => playFiltered(freq, 0.2, 0.1), i * 80));
        else if (style === 'retro') notes.forEach((freq, i) => setTimeout(() => playRetro(freq, 0.18, 0.1), i * 70));
        else if (style === 'wood') notes.forEach((freq, i) => setTimeout(() => playWoodTone(freq, 0.2, 0.15), i * 90));
        else if (style === 'bell') notes.forEach((freq, i) => setTimeout(() => playBell(freq, 0.3, 0.1), i * 100));
        else if (style === 'space') notes.forEach((freq, i) => setTimeout(() => playSpace(freq, 0.25, 0.08), i * 90));
        else if (style === 'drum') notes.forEach((freq, i) => setTimeout(() => playDrum(freq, 0.15, 0.1), i * 70));
        else if (style === 'piano') notes.forEach((freq, i) => setTimeout(() => playPiano(freq, 0.25, 0.12), i * 90));
    }

    function playDrawSound() {
        initAudio();
        const style = settings.soundStyle;
        if (style === 'classic') { playOsc(261.63, 'triangle', 0.3, 0.1); setTimeout(() => playOsc(196, 'triangle', 0.3, 0.1), 180); }
        else if (style === 'electronic') { playFiltered(261, 0.3, 0.1); setTimeout(() => playFiltered(196, 0.3, 0.1), 180); }
        else if (style === 'retro') { playRetro(261, 0.25, 0.1); setTimeout(() => playRetro(196, 0.25, 0.1), 150); }
        else if (style === 'wood') { playWoodTone(261, 0.2, 0.12); setTimeout(() => playWoodTone(196, 0.2, 0.12), 180); }
        else if (style === 'bell') { playBell(261, 0.3, 0.1); setTimeout(() => playBell(196, 0.3, 0.1), 200); }
        else if (style === 'space') { playSpace(261, 0.3, 0.08); setTimeout(() => playSpace(196, 0.3, 0.08), 200); }
        else if (style === 'drum') { playDrum(261, 0.2, 0.1); setTimeout(() => playDrum(196, 0.2, 0.1), 180); }
        else if (style === 'piano') { playPiano(261, 0.3, 0.12); setTimeout(() => playPiano(196, 0.3, 0.12), 200); }
    }

    /* ===== Game Flow ===== */
    function setMode(mode) {
        clearTimeout(aiTimer); aiTimer = null;
        if (currentMode === mode) return;
        currentMode = mode;
        modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        if (currentMode === 'pve') subtitle.textContent = t('subtitle-pve');
        else if (currentMode === 'pvp') subtitle.textContent = t('subtitle-pvp');
        else if (currentMode === 'aivsai') subtitle.textContent = t('subtitle-aivsai');
        else subtitle.textContent = t('subtitle-connect4');
        aiDifficultyGroup.style.display = (currentMode === 'pve' || currentMode === 'connect4') ? 'flex' : 'none';
        updateScoreLabels();
        resetGame();
    }

    function updateScoreLabels() {
        const labelX = document.querySelector('.score-card.player-x .label');
        const labelO = document.querySelector('.score-card.player-o .label');
        if (currentMode === 'connect4') {
            labelX.textContent = t('label-player-x');
            labelO.textContent = currentMode === 'connect4' && (currentMode === 'pvp' ? t('label-player-o-pvp') : t('label-player-o'));
        } else if (currentMode === 'pve') { labelX.textContent = t('label-player-x'); labelO.textContent = t('label-player-o'); }
        else if (currentMode === 'pvp') { labelX.textContent = t('label-player-x-pvp'); labelO.textContent = t('label-player-o-pvp'); }
        else { labelX.textContent = t('label-player-x-ai'); labelO.textContent = t('label-player-o-ai'); }
    }

    function getTurnText() {
        if (currentMode === 'aivsai') return currentPlayer === PLAYER_X ? t('status-ai-x-thinking') : t('status-ai-o-thinking');
        if (currentMode === 'pvp' || currentMode === 'connect4') return currentPlayer === PLAYER_X ? t('status-player1-turn') : t('status-player2-turn');
        return currentPlayer === PLAYER_X ? t('status-your-turn') : t('status-ai-thinking');
    }

    /* ===== Tic Tac Toe ===== */
    function handleCellClick(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        if (!gameActive || gameBoard[index] !== '') return;
        if (currentMode === 'aivsai') return;
        if (currentMode === 'pve' && currentPlayer !== PLAYER_X) return;

        makeMove(index, currentPlayer);

        if (gameActive && currentMode === 'pve') {
            updateStatus(getTurnText(), 'o');
            lockBoard(true);
            const delay = settings.animations ? 400 : 50;
            aiTimer = setTimeout(() => {
                if (!gameActive) return;
                const aiMove = getAiMove(gameBoard, PLAYER_O);
                makeMove(aiMove, PLAYER_O);
                lockBoard(false);
            }, delay);
        }
    }

    function makeMove(index, player) {
        gameBoard[index] = player;
        cells[index].innerHTML = player === PLAYER_X ? xSvg : oSvg;
        cells[index].classList.add('disabled');
        playMoveSound(player);

        if (checkWinTTT(gameBoard, player)) {
            endGame(false, player);
        } else if (checkDrawTTT(gameBoard)) {
            endGame(true);
        } else {
            currentPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
            const activeClass = currentPlayer === PLAYER_X ? 'x' : 'o';
            updateStatus(getTurnText(), activeClass);
        }
    }

    /* ===== Connect Four ===== */
    function handleC4CellClick(e) {
        if (!gameActive || currentMode === 'aivsai') return;
        if ((currentMode === 'pve' || currentMode === 'connect4') && currentPlayer !== PLAYER_X) return;

        const col = parseInt(e.currentTarget.dataset.col);
        const row = getC4NextOpenRow(col);
        if (row === -1) return;

        makeC4Move(row, col, currentPlayer);

        if (gameActive && (currentMode === 'pve' || currentMode === 'connect4')) {
            updateStatus(getTurnText(), 'o');
            lockC4Board(true);
            const delay = settings.animations ? 600 : 80;
            aiTimer = setTimeout(() => {
                if (!gameActive) return;
                const aiCol = getC4AiMove();
                if (aiCol !== -1) {
                    const aiRow = getC4NextOpenRow(aiCol);
                    makeC4Move(aiRow, aiCol, PLAYER_O);
                }
                lockC4Board(false);
            }, delay);
        }
    }

    function getC4NextOpenRow(col) {
        for (let r = C4_ROWS - 1; r >= 0; r--) {
            if (c4Board[r][col] === '') return r;
        }
        return -1;
    }

    function makeC4Move(row, col, player) {
        c4Board[row][col] = player;
        const cell = c4CellsContainer.children[row * C4_COLS + col];
        const piece = document.createElement('div');
        piece.className = 'c4-piece ' + (player === PLAYER_X ? 'x-piece' : 'o-piece');
        cell.appendChild(piece);
        cell.classList.add('disabled');
        playMoveSound(player);

        const winCells = checkWinC4(row, col, player);
        if (winCells) {
            endC4Game(false, player, winCells);
        } else if (checkDrawC4()) {
            endC4Game(true);
        } else {
            currentPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
            const activeClass = currentPlayer === PLAYER_X ? 'x' : 'o';
            updateStatus(getTurnText(), activeClass);
        }
    }

    function checkWinC4(row, col, player) {
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diag down-right
            [1, -1], // diag down-left
        ];
        for (const [dr, dc] of directions) {
            const cells = [[row, col]];
            for (let step = 1; step < 4; step++) {
                const r = row + dr * step, c = col + dc * step;
                if (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && c4Board[r][c] === player) cells.push([r, c]);
                else break;
            }
            for (let step = 1; step < 4; step++) {
                const r = row - dr * step, c = col - dc * step;
                if (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && c4Board[r][c] === player) cells.push([r, c]);
                else break;
            }
            if (cells.length >= 4) return cells;
        }
        return null;
    }

    function checkDrawC4() {
        return c4Board[0].every(cell => cell !== '');
    }

    function endC4Game(draw, winner, winCells) {
        gameActive = false;
        lockC4Board(true);

        if (draw) {
            scores.draw++;
            animateScore(scoreDrawEl);
            playDrawSound();
            showModal('🤝', t('status-draw'), t('modal-draw-pvp'));
            updateStatus(t('status-draw'), null);
        } else {
            scores[winner]++;
            animateScore(winner === PLAYER_X ? scoreXEl : scoreOEl);
            drawC4WinLine(winCells);
            playWinSound();
            let icon = '🎉', title, msg;
            if (winner === PLAYER_X) {
                title = currentMode === 'pvp' || currentMode === 'connect4' ? t('modal-player1-wins') : t('modal-you-win');
                msg = currentMode === 'pvp' || currentMode === 'connect4' ? t('modal-player1-wins') : t('modal-you-win');
                updateStatus(title, 'x');
            } else {
                title = currentMode === 'pvp' || currentMode === 'connect4' ? t('modal-player2-wins') : t('modal-ai-wins');
                msg = currentMode === 'pvp' || currentMode === 'connect4' ? t('modal-player2-wins') : t('modal-ai-wins');
                icon = currentMode === 'pvp' || currentMode === 'connect4' ? '🔥' : '🤖';
                updateStatus(title, 'o');
            }
            showModal(icon, title, msg);
        }
    }

    function drawC4WinLine(winCells) {
        if (!winCells || winCells.length < 2) return;
        const [r1, c1] = winCells[0];
        const [r2, c2] = winCells[winCells.length - 1];
        const cell1 = c4CellsContainer.children[r1 * C4_COLS + c1];
        const cell2 = c4CellsContainer.children[r2 * C4_COLS + c2];
        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        const boardRect = connect4Board.getBoundingClientRect();
        const padding = 10;
        const innerW = boardRect.width - padding * 2;
        const innerH = boardRect.height - padding * 2;
        const scaleX = 700 / innerW;
        const scaleY = 600 / innerH;

        c4WinLineSvg.setAttribute('x1', (rect1.left + rect1.width / 2 - boardRect.left - padding) * scaleX);
        c4WinLineSvg.setAttribute('y1', (rect1.top + rect1.height / 2 - boardRect.top - padding) * scaleY);
        c4WinLineSvg.setAttribute('x2', (rect2.left + rect2.width / 2 - boardRect.left - padding) * scaleX);
        c4WinLineSvg.setAttribute('y2', (rect2.top + rect2.height / 2 - boardRect.top - padding) * scaleY);
        c4WinLineSvg.setAttribute('stroke', currentPlayer === PLAYER_X ? 'var(--x-color)' : 'var(--o-color)');
        c4WinLine.classList.add('show');
    }

    function lockC4Board(lock) {
        document.querySelectorAll('.c4-cell').forEach(cell => {
            const col = parseInt(cell.dataset.col);
            const row = getC4NextOpenRow(col);
            if (row !== -1) cell.classList.toggle('disabled', lock);
        });
    }

    /* ===== Connect Four AI ===== */
    function getC4AiMove() {
        const diff = settings.difficulty;
        if (diff === 'hard') return getC4BestMove(PLAYER_O);
        if (diff === 'easy') return getC4EasyMove();
        return Math.random() < 0.5 ? getC4BestMove(PLAYER_O) : getC4EasyMove();
    }

    function getC4EasyMove() {
        // Win if possible
        for (let c = 0; c < C4_COLS; c++) {
            const r = getC4NextOpenRow(c);
            if (r === -1) continue;
            c4Board[r][c] = PLAYER_O;
            const win = checkWinC4(r, c, PLAYER_O);
            c4Board[r][c] = '';
            if (win) return c;
        }
        // Block if opponent can win
        for (let c = 0; c < C4_COLS; c++) {
            const r = getC4NextOpenRow(c);
            if (r === -1) continue;
            c4Board[r][c] = PLAYER_X;
            const win = checkWinC4(r, c, PLAYER_X);
            c4Board[r][c] = '';
            if (win) return c;
        }
        // Prefer center
        const prefs = [3, 2, 4, 1, 5, 0, 6];
        for (const c of prefs) {
            if (getC4NextOpenRow(c) !== -1) return c;
        }
        return -1;
    }

    function getC4BestMove(aiPlayer) {
        let bestScore = -Infinity, bestCol = -1;
        const humanPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        for (let c = 0; c < C4_COLS; c++) {
            const r = getC4NextOpenRow(c);
            if (r === -1) continue;
            c4Board[r][c] = aiPlayer;
            const score = minimaxC4(0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
            c4Board[r][c] = '';
            if (score > bestScore) { bestScore = score; bestCol = c; }
        }
        return bestCol;
    }

    function minimaxC4(depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
        // Terminal checks
        for (let r = 0; r < C4_ROWS; r++) {
            for (let c = 0; c < C4_COLS; c++) {
                if (c4Board[r][c] !== '') {
                    if (checkWinC4(r, c, aiPlayer)) return 1000 - depth;
                    if (checkWinC4(r, c, humanPlayer)) return depth - 1000;
                }
            }
        }
        if (checkDrawC4()) return 0;
        if (depth >= 3) return evaluateC4Board(aiPlayer, humanPlayer);

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let c = 0; c < C4_COLS; c++) {
                const r = getC4NextOpenRow(c);
                if (r === -1) continue;
                c4Board[r][c] = aiPlayer;
                bestScore = Math.max(bestScore, minimaxC4(depth + 1, false, aiPlayer, humanPlayer, alpha, beta));
                c4Board[r][c] = '';
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let c = 0; c < C4_COLS; c++) {
                const r = getC4NextOpenRow(c);
                if (r === -1) continue;
                c4Board[r][c] = humanPlayer;
                bestScore = Math.min(bestScore, minimaxC4(depth + 1, true, aiPlayer, humanPlayer, alpha, beta));
                c4Board[r][c] = '';
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
            return bestScore;
        }
    }

    function evaluateC4Board(aiPlayer, humanPlayer) {
        let score = 0;
        // Center column preference
        for (let r = 0; r < C4_ROWS; r++) {
            if (c4Board[r][3] === aiPlayer) score += 3;
            else if (c4Board[r][3] === humanPlayer) score -= 3;
        }
        // Check all windows of 4
        const directions = [[0,1],[1,0],[1,1],[1,-1]];
        for (let r = 0; r < C4_ROWS; r++) {
            for (let c = 0; c < C4_COLS; c++) {
                for (const [dr, dc] of directions) {
                    const window = [];
                    for (let i = 0; i < 4; i++) {
                        const rr = r + dr * i, cc = c + dc * i;
                        if (rr >= 0 && rr < C4_ROWS && cc >= 0 && cc < C4_COLS) window.push(c4Board[rr][cc]);
                    }
                    if (window.length === 4) {
                        const aiCount = window.filter(v => v === aiPlayer).length;
                        const humanCount = window.filter(v => v === humanPlayer).length;
                        if (aiCount > 0 && humanCount === 0) score += aiCount * aiCount;
                        if (humanCount > 0 && aiCount === 0) score -= humanCount * humanCount;
                    }
                }
            }
        }
        return score;
    }

    /* ===== Shared Game Logic ===== */
    function lockBoard(lock) {
        cells.forEach(cell => {
            const idx = parseInt(cell.dataset.index);
            if (gameBoard[idx] === '') cell.classList.toggle('disabled', lock);
        });
    }

    function updateStatus(text, activeClass) {
        statusText.textContent = text;
        statusBar.classList.remove('active-x', 'active-o');
        if (activeClass) statusBar.classList.add(`active-${activeClass}`);
    }

    function endGame(draw, winner) {
        gameActive = false;
        lockBoard(true);

        if (draw) {
            scores.draw++;
            animateScore(scoreDrawEl);
            playDrawSound();
            const msg = currentMode === 'aivsai' ? t('modal-draw-aivsai') : t('modal-draw-pvp');
            showModal('🤝', t('status-draw'), msg);
            updateStatus(t('status-draw'), null);
        } else {
            scores[winner]++;
            animateScore(winner === PLAYER_X ? scoreXEl : scoreOEl);
            drawWinLine(winner);
            playWinSound();

            let icon, title, msg;
            if (winner === PLAYER_X) {
                title = getWinnerText(winner);
                icon = currentMode === 'aivsai' ? '⚡' : '🎉';
                if (currentMode === 'aivsai') msg = t('modal-ai-x-wins');
                else if (currentMode === 'pvp') msg = t('modal-player1-wins');
                else msg = t('modal-you-win');
                updateStatus(title, 'x');
            } else {
                title = getWinnerText(winner);
                icon = currentMode === 'aivsai' ? '⚡' : (currentMode === 'pvp' ? '🔥' : '🤖');
                if (currentMode === 'aivsai') msg = t('modal-ai-o-wins');
                else if (currentMode === 'pvp') msg = t('modal-player2-wins');
                else msg = t('modal-ai-wins');
                updateStatus(title, 'o');
            }
            showModal(icon, title, msg);
        }
    }

    function getWinnerText(winner) {
        if (currentMode === 'aivsai') return (winner === PLAYER_X ? t('label-player-x-ai') : t('label-player-o-ai')) + ' ' + t('modal-win');
        if (currentMode === 'pvp') return winner === PLAYER_X ? t('modal-player1-wins') : t('modal-player2-wins');
        return winner === PLAYER_X ? t('modal-you-win') : t('modal-ai-wins');
    }

    function animateScore(el) {
        el.classList.add('pop');
        el.textContent = parseInt(el.textContent) + 1;
        setTimeout(() => el.classList.remove('pop'), 200);
    }

    function resetGame() {
        clearTimeout(aiTimer); aiTimer = null;
        gameActive = true;
        currentPlayer = PLAYER_X;

        if (isC4Mode()) {
            c4Board = Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(''));
            document.querySelectorAll('.c4-cell').forEach(cell => {
                cell.innerHTML = '';
                cell.classList.remove('disabled');
            });
            c4WinLine.classList.remove('show');
            connect4Board.style.display = 'block';
            boardEl.style.display = 'none';
            hideModal();
            updateStatus(getTurnText(), 'x');
            if (currentMode === 'connect4') {
                lockC4Board(true);
                const delay = settings.animations ? 600 : 80;
                aiTimer = setTimeout(() => {
                    if (!gameActive) return;
                    const aiCol = getC4AiMove();
                    if (aiCol !== -1) {
                        const aiRow = getC4NextOpenRow(aiCol);
                        makeC4Move(aiRow, aiCol, PLAYER_O);
                    }
                    lockC4Board(false);
                }, delay);
            }
        } else {
            gameBoard = Array(9).fill('');
            cells.forEach(cell => { cell.innerHTML = ''; cell.classList.remove('disabled'); });
            hideWinLine();
            connect4Board.style.display = 'none';
            boardEl.style.display = 'grid';
            hideModal();
            updateStatus(getTurnText(), 'x');
            if (currentMode === 'aivsai') startAiVsAi();
        }
    }

    function isC4Mode() {
        return currentMode === 'connect4';
    }

    /* ===== Modal ===== */
    function showModal(icon, title, msg) {
        modalIcon.textContent = icon;
        modalTitle.textContent = title;
        modalMessage.textContent = msg;
        modal.classList.add('show');
    }
    function hideModal() { modal.classList.remove('show'); }

    /* ===== Win Line ===== */
    function drawWinLine(winner) {
        const condition = getWinningConditionTTT(gameBoard, winner);
        if (!condition) return;
        const [a, , c] = condition;
        const posA = getCellCenter(a);
        const posB = getCellCenter(c);
        const rect = boardEl.getBoundingClientRect();
        const padding = 12;
        const innerW = rect.width - padding * 2;
        const innerH = rect.height - padding * 2;
        const scaleX = 300 / innerW;
        const scaleY = 300 / innerH;
        winLineSvg.setAttribute('x1', (posA.x - rect.left - padding) * scaleX);
        winLineSvg.setAttribute('y1', (posA.y - rect.top - padding) * scaleY);
        winLineSvg.setAttribute('x2', (posB.x - rect.left - padding) * scaleX);
        winLineSvg.setAttribute('y2', (posB.y - rect.top - padding) * scaleY);
        winLineSvg.setAttribute('stroke', winner === PLAYER_X ? 'var(--x-color)' : 'var(--o-color)');
        winLine.classList.add('show');
    }
    function hideWinLine() { winLine.classList.remove('show'); }
    function getCellCenter(index) {
        const rect = cells[index].getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    /* ===== TTT Game Logic ===== */
    function checkWinTTT(board, player) {
        return tttWinConditions.some(cond => cond.every(i => board[i] === player));
    }
    function getWinningConditionTTT(board, player) {
        return tttWinConditions.find(cond => cond.every(i => board[i] === player)) || null;
    }
    function checkDrawTTT(board) { return board.every(cell => cell !== ''); }

    /* ===== TTT AI ===== */
    function getAiMove(board, aiPlayer) {
        const humanPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        const diff = settings.difficulty;
        if (diff === 'hard') return getBestMoveGeneric(board, aiPlayer);
        if (diff === 'easy') return getEasyMoveTTT(board, aiPlayer, humanPlayer);
        return Math.random() < 0.5 ? getBestMoveGeneric(board, aiPlayer) : getEasyMoveTTT(board, aiPlayer, humanPlayer);
    }

    function getEasyMoveTTT(board, aiPlayer, humanPlayer) {
        for (let i = 0; i < 9; i++) if (board[i] === '') {
            board[i] = aiPlayer;
            const win = checkWinTTT(board, aiPlayer);
            board[i] = '';
            if (win) return i;
        }
        for (let i = 0; i < 9; i++) if (board[i] === '') {
            board[i] = humanPlayer;
            const lose = checkWinTTT(board, humanPlayer);
            board[i] = '';
            if (lose) return i;
        }
        const empties = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
        return empties[Math.floor(Math.random() * empties.length)];
    }

    function getBestMoveGeneric(board, aiPlayer) {
        const humanPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
        let bestScore = -Infinity, move = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiPlayer;
                const score = minimaxGeneric(board, 0, false, aiPlayer, humanPlayer);
                board[i] = '';
                if (score > bestScore) { bestScore = score; move = i; }
            }
        }
        return move;
    }

    function minimaxGeneric(board, depth, isMaximizing, aiPlayer, humanPlayer) {
        if (checkWinTTT(board, aiPlayer)) return 10 - depth;
        if (checkWinTTT(board, humanPlayer)) return depth - 10;
        if (checkDrawTTT(board)) return 0;
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiPlayer;
                    bestScore = Math.max(bestScore, minimaxGeneric(board, depth + 1, false, aiPlayer, humanPlayer));
                    board[i] = '';
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = humanPlayer;
                    bestScore = Math.min(bestScore, minimaxGeneric(board, depth + 1, true, aiPlayer, humanPlayer));
                    board[i] = '';
                }
            }
            return bestScore;
        }
    }

    /* ===== AI vs AI TTT ===== */
    function startAiVsAi() {
        if (!gameActive || currentMode !== 'aivsai') return;
        lockBoard(true);
        const delay = settings.animations ? 500 : 50;
        aiTimer = setTimeout(() => {
            if (!gameActive || currentMode !== 'aivsai') return;
            const move = getAiMove(gameBoard, currentPlayer);
            makeMove(move, currentPlayer);
            if (gameActive) {
                startAiVsAi();
            } else {
                const nextDelay = settings.animations ? 1200 : 300;
                aiTimer = setTimeout(() => { if (currentMode === 'aivsai') resetGame(); }, nextDelay);
            }
        }, delay);
    }

    /* ===== Changelog ===== */
    function openChangelog() { renderChangelog(); changelogModal.classList.add('show'); }
    function closeChangelog() { changelogModal.classList.remove('show'); }

    function renderChangelog() {
        changelogBody.innerHTML = '';
        changelogData.forEach(v => {
            const block = document.createElement('div');
            block.className = 'version-block';
            const header = document.createElement('div');
            header.className = 'version-header';
            const badge = document.createElement('span');
            badge.className = 'version-badge';
            badge.textContent = 'v' + v.version;
            const date = document.createElement('span');
            date.className = 'version-date';
            date.textContent = v.date[settings.lang] || v.date.en;
            header.appendChild(badge);
            header.appendChild(date);
            const list = document.createElement('ul');
            list.className = 'version-list';
            const items = v.items[settings.lang] || v.items.en;
            items.forEach(txt => {
                const li = document.createElement('li');
                li.textContent = txt;
                list.appendChild(li);
            });
            block.appendChild(header);
            block.appendChild(list);
            changelogBody.appendChild(block);
        });
    }

    init();
})();
