"use strict";

const { Client } = require('discord-rpc');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// ─── ANSI 컬러 로그 함수 ──────────────────────────────
const Logger = {
    success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`),
    warning: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`),
    error: (msg) => console.error(`\x1b[31m${msg}\x1b[0m`),
    info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
    separator: () => console.log('\x1b[35m%s\x1b[0m', '===================================================')
};

// ─── 유틸리티 함수 ─────────────────────────────────────
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

const isValidImageURL = (url) => {
    if (!isValidURL(url)) return false;
    const pathname = new URL(url).pathname.toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => pathname.endsWith(ext));
};

// ─── 명령어 정보 ──────────────────────────────────────
const commandsInfo = {
    details: {
        description: "RPC 상태의 상세 메시지를 설정합니다.",
        usage: "details:새로운 상태 메시지"
    },
    state: {
        description: "RPC 상태의 간단한 상태 텍스트를 설정합니다.",
        usage: "state:즐거운 시간 보내세요!"
    },
    timestamp: {
        description: "RPC 상태의 시작 타임스탬프를 밀리초 단위로 설정합니다.",
        usage: "timestamp:1672531200000"
    },
    largeImage: {
        description: "큰 이미지 키와 텍스트를 설정합니다. 이미지 키는 에셋 키 또는 유효한 이미지 링크여야 합니다.",
        usage: "largeImage:newImageKey || 새 큰 이미지 텍스트\n또는\nlargeImage:https://example.com/image.png || 이미지 설명"
    },
    smallImage: {
        description: "작은 이미지 키와 텍스트를 설정합니다. 이미지 키는 에셋 키 또는 유효한 이미지 링크여야 합니다.",
        usage: "smallImage:newSmallImageKey || 새 작은 이미지 텍스트\n또는\nsmallImage:https://example.com/image_small.png || 이미지 설명"
    },
    addButton: {
        description: "RPC 상태에 버튼을 추가합니다. 최대 2개까지 추가 가능합니다.",
        usage: "addButton:버튼 라벨 || https://example.com"
    },
    clearButtons: {
        description: "모든 버튼을 제거합니다.",
        usage: "clearButtons"
    },
    setStateType: {
        description: "RPC 상태의 유형을 설정합니다. (playing, listening, watching, streaming)",
        usage: "setStateType:playing"
    },
    save: {
        description: "현재 RPC 상태를 지정한 이름의 JSON 파일로 저장합니다. 파일명은 필수이며, 중복되면 저장되지 않습니다.",
        usage: "save:<파일명.json> (예: save:myState.json)"
    },
    load: {
        description: "저장된 JSON 파일에서 RPC 상태를 불러옵니다. 파일명은 필수입니다.",
        usage: "load:<파일명.json> (예: load:myState.json)"
    },
    reset: {
        description: "RPC 상태를 기본값으로 초기화합니다.",
        usage: "reset"
    },
    help: {
        description: "전체 명령어 목록 또는 특정 명령어의 도움말을 확인합니다.",
        usage: "help <명령어> 또는 ? <명령어>"
    },
    exit: {
        description: "프로그램을 종료합니다.",
        usage: "exit"
    }
};

// ─── RPCManager 클래스 ─────────────────────────────────
class RPCManager {
    constructor(rl) {
        this.rl = rl;
        this.clientIdsFilePath = path.join(__dirname, 'clientIds.json');
        this.historyFilePath = path.join(__dirname, 'history.log');
        this.savesDir = path.join(__dirname, 'saves');
        this.defaultRPCState = {
            details: '기본 설명',
            startTimestamp: new Date().setHours(0, 0, 0, 0),
            buttons: [{ label: '기본 버튼 (리포지토리 보기)', url: 'https://github.com/' }],
            state: '기본 상태',
            largeImageKey: '',
            largeImageText: '',
            type: 'playing'
        };
        this.rpcStatus = { ...this.defaultRPCState };
        this.clientIds = [];
        this.currentClientId = '';
        this.client = null;
    }

    // ── 비동기 질문 메서드 ─────────────────────────────
    ask(prompt) {
        return new Promise(resolve => this.rl.question(prompt, answer => resolve(answer)));
    }

    // ── 파일 I/O 관련 ─────────────────────────────
    loadClientIds() {
        if (!fs.existsSync(this.clientIdsFilePath)) {
            const defaultData = { clients: [] };
            fs.writeFileSync(this.clientIdsFilePath, JSON.stringify(defaultData, null, 4));
            Logger.warning(`❗ ${this.clientIdsFilePath} 파일이 존재하지 않아 새로 생성되었습니다.`);
            Logger.warning('클라이언트 정보를 추가한 후 다시 실행해주세요.');
            process.exit(1);
        }
        try {
            const data = JSON.parse(fs.readFileSync(this.clientIdsFilePath, 'utf8'));
            if (!Array.isArray(data.clients) || data.clients.length === 0) {
                Logger.warning(`❗ ${this.clientIdsFilePath} 파일의 clients 배열이 비어 있습니다.`);
                Logger.warning('클라이언트 정보를 추가한 후 다시 실행해주세요.');
                process.exit(1);
            }
            this.clientIds = data.clients;
            Logger.success(`✅ 클라이언트 ID 목록 로드 완료! (${this.clientIds.length} 개)`);
        } catch (err) {
            Logger.error(`❌ clientIds.json 파일 읽는 중 오류: ${err.message}`);
            process.exit(1);
        }
    }

    saveRPCState(fileName) {
        if (!fileName) {
            Logger.warning('❗ 파일명을 입력해주세요. 예: save:myState.json');
            return;
        }
        if (!fs.existsSync(this.savesDir)) {
            fs.mkdirSync(this.savesDir, { recursive: true });
        }
        const filePath = path.join(this.savesDir, fileName);
        if (fs.existsSync(filePath)) {
            const existingContent = fs.readFileSync(filePath, 'utf8');
            const currentState = JSON.stringify(this.rpcStatus, null, 4);
            if (existingContent === currentState) {
                Logger.warning(`❗ 현재 상태가 이미 '${fileName}'에 저장되어 있습니다.`);
            } else {
                Logger.warning(`❗ 파일 이름 '${fileName}'이(가) 이미 사용 중입니다. 다른 이름을 사용해주세요.`);
            }
            return;
        }
        try {
            fs.writeFileSync(filePath, JSON.stringify(this.rpcStatus, null, 4));
            Logger.success(`✅ RPC 상태가 '${fileName}'에 저장되었습니다.`);
        } catch (err) {
            Logger.error(`❌ RPC 상태 저장 오류: ${err.message}`);
        }
    }

    loadRPCState(fileName) {
        if (!fileName) {
            Logger.warning('❗ 파일명을 입력해주세요. 예: load:myState.json');
            return;
        }
        const filePath = path.join(this.savesDir, fileName);
        try {
            if (fs.existsSync(filePath)) {
                this.rpcStatus = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                Logger.success(`✅ '${fileName}'에서 RPC 상태를 불러왔습니다.`);
            } else {
                Logger.warning(`❗ '${fileName}' 파일이 존재하지 않습니다.`);
            }
        } catch (err) {
            Logger.error(`❌ RPC 상태 불러오기 오류: ${err.message}`);
        }
    }

    resetRPCState() {
        this.rpcStatus = { ...this.defaultRPCState };
        Logger.success('✅ RPC 상태가 초기화되었습니다.');
    }

    prependHistoryEntry(entry) {
        const oldContent = fs.existsSync(this.historyFilePath)
            ? fs.readFileSync(this.historyFilePath, 'utf8')
            : "";
        const newContent = `${entry}\n${oldContent}`;
        try {
            fs.writeFileSync(this.historyFilePath, newContent);
            Logger.success('✅ 상태 변경 기록이 저장되었습니다.');
        } catch (err) {
            Logger.error(`❌ 상태 변경 기록 저장 오류: ${err.message}`);
        }
    }

    // ── Discord RPC 클라이언트 관련 ───────────────
    createClient() {
        this.client = new Client({ transport: 'ipc' });
        this.client.on('disconnected', () => {
            Logger.warning('⚠️ RPC 연결이 끊어졌습니다. 5초 후 재연결 시도 중...');
            setTimeout(() => this.loginClient(), 5000);
        });
    }

    async loginClient() {
        if (!this.client || !this.currentClientId) {
            Logger.error('❌ 클라이언트가 초기화되지 않았거나, 클라이언트 ID가 없습니다.');
            return;
        }
        try {
            Logger.info('🔄 RPC 로그인 시도 중...');
            await this.client.login({ clientId: this.currentClientId });
            Logger.success('✅ RPC 클라이언트에 로그인했습니다.');
            this.printAllCommands();
            await this.updateRPC();
        } catch (err) {
            Logger.error(`❌ 로그인 실패: ${err.message}`);
            setTimeout(() => this.loginClient(), 5000);
        }
    }

    async updateRPC() {
        if (!this.client || !this.client.user) {
            Logger.error('❌ RPC 클라이언트가 로그인되지 않았습니다.');
            return;
        }
        try {
            await this.client.setActivity(this.rpcStatus);
            Logger.success('✅ RPC 상태가 업데이트되었습니다.');
            const entry = `[${new Date().toLocaleString()}] ${JSON.stringify(this.rpcStatus)}`;
            this.prependHistoryEntry(entry);
        } catch (err) {
            Logger.error(`❌ RPC 업데이트 오류: ${err.message}`);
        }
    }

    async selectClient() {
        if (this.clientIds.length === 0) {
            Logger.warning('❗ 저장된 클라이언트 ID가 존재하지 않습니다.');
            process.exit(1);
        }
        Logger.separator();
        Logger.info('사용할 클라이언트를 선택해주세요:');
        this.clientIds.forEach((c, index) => {
            console.log(`  [${index + 1}] ${c.name}`);
        });
        Logger.separator();

        const answer = await this.ask('번호 입력: ');
        const index = parseInt(answer, 10) - 1;
        if (isNaN(index) || index < 0 || index >= this.clientIds.length) {
            Logger.warning('❗ 잘못된 번호입니다. 프로그램을 종료합니다.');
            process.exit(1);
        }
        this.currentClientId = this.clientIds[index].clientId;
        Logger.success(`✅ 선택한 클라이언트: ${this.clientIds[index].name}`);
        this.createClient();
        this.loginClient();
    }

    // ── 명령어 도움말 ─────────────────────────────
    printAllCommands() {
        Logger.separator();
        Logger.info("전체 명령어 리스트:");
        for (const [cmd, info] of Object.entries(commandsInfo)) {
            console.log(`  ${cmd} - ${info.description}`);
        }
        Logger.separator();
        Logger.info('상세 도움말은: help <명령어> 또는 ? <명령어>');
    }

    printCommandHelp(cmd) {
        if (commandsInfo[cmd]) {
            Logger.separator();
            Logger.info(`명령어: ${cmd}`);
            console.log(`설명: ${commandsInfo[cmd].description}`);
            console.log(`사용법: ${commandsInfo[cmd].usage}`);
            Logger.separator();
        } else {
            Logger.warning(`'${cmd}' 명령어에 대한 정보가 없습니다.`);
        }
    }

    // ── 명령어 처리 ─────────────────────────────
    async handleCommand(input) {
        const [rawCommand, ...rawArgs] = input.split(':');
        const command = rawCommand.trim();
        const value = rawArgs.join(':').trim();

        const handlers = {
            details: () => { this.rpcStatus.details = value; return true; },
            state: () => { this.rpcStatus.state = value; return true; },
            timestamp: () => {
                const ts = parseInt(value, 10);
                if (!isNaN(ts)) {
                    this.rpcStatus.startTimestamp = ts;
                    return true;
                } else {
                    Logger.warning('❗ 유효하지 않은 타임스탬프입니다.');
                    return false;
                }
            },
            largeImage: () => {
                const [key, ...textParts] = value.split(' || ');
                if (isValidURL(key) && !isValidImageURL(key)) {
                    Logger.warning('❗ 유효하지 않은 이미지 링크입니다. (jpg, jpeg, png, gif, webp 파일만 지원)');
                    return false;
                }
                this.rpcStatus.largeImageKey = key;
                this.rpcStatus.largeImageText = textParts.join(' ');
                return true;
            },
            smallImage: () => {
                const [key, ...textParts] = value.split(' || ');
                if (isValidURL(key) && !isValidImageURL(key)) {
                    Logger.warning('❗ 유효하지 않은 이미지 링크입니다. (jpg, jpeg, png, gif, webp 파일만 지원)');
                    return false;
                }
                this.rpcStatus.smallImageKey = key;
                this.rpcStatus.smallImageText = textParts.join(' || ');
                return true;
            },
            addButton: () => {
                const [label, ...urlParts] = value.split(' || ');
                const url = urlParts.join(' ').trim();
                if (!isValidURL(url)) {
                    Logger.warning('❗ 유효하지 않은 URL입니다.');
                    return false;
                }
                if (this.rpcStatus.buttons.length < 2) {
                    this.rpcStatus.buttons.push({ label, url });
                    return true;
                } else {
                    Logger.warning('❗ 버튼은 최대 2개까지만 추가할 수 있습니다.');
                    return false;
                }
            },
            clearButtons: () => { 
                this.rpcStatus.buttons = [];
                Logger.success('✅ 모든 버튼이 삭제되었습니다.');
                return true;
            },
            setStateType: () => {
                const validTypes = ['playing', 'listening', 'watching', 'streaming'];
                if (validTypes.includes(value)) {
                    this.rpcStatus.type = value;
                    Logger.success(`✅ 상태 유형이 '${value}'로 설정되었습니다.`);
                    return true;
                } else {
                    Logger.warning('❗ 유효하지 않은 상태 유형입니다. (가능한 값: playing, listening, watching, streaming)');
                    return false;
                }
            },
            save: () => { 
                this.saveRPCState(value);
                return false;
            },
            load: () => { 
                this.loadRPCState(value);
                return true;
            },
            reset: () => { 
                this.resetRPCState();
                return true;
            },
            help: () => {
                if (value) {
                    this.printCommandHelp(value);
                } else {
                    this.printAllCommands();
                }
                return false;
            },
            '?': () => {
                if (value) {
                    this.printCommandHelp(value);
                } else {
                    this.printAllCommands();
                }
                return false;
            },
            exit: () => {
                Logger.info('👋 프로그램을 종료합니다.');
                process.exit(0);
            }
        };

        if (handlers.hasOwnProperty(command)) {
            const stateModified = handlers[command]();
            if (stateModified) {
                await this.updateRPC();
            }
        } else {
            Logger.warning('❗ 알 수 없는 명령어입니다. "help" 또는 "? <명령어>"를 입력하여 도움말을 확인해주세요.');
        }
    }
}

// ─── 메인 실행 ─────────────────────────────────────
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const rpcManager = new RPCManager(rl);
rpcManager.loadClientIds();
rpcManager.selectClient();

rl.on('line', async (input) => {
    await rpcManager.handleCommand(input);
});