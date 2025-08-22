// API 기본 URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'http://34.63.185.176:3000/api';

// 전역 변수
let currentUser = null;
let characters = [];
let settings = [];

// API 호출 함수
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API 호출 실패');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 사용자 인증 관련 함수들
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 캐릭터 관련 API 함수들
async function loadCharacters() {
    try {
        const response = await apiCall('/characters', {
            headers: getAuthHeaders()
        });
        characters = response;
        updateCharacterMenu();
        return response;
    } catch (error) {
        console.error('캐릭터 로드 실패:', error);
        return [];
    }
}

async function createCharacter(characterData) {
    try {
        const formData = new FormData();
        
        // 텍스트 데이터 추가
        Object.keys(characterData).forEach(key => {
            if (key !== 'image' && characterData[key] !== null) {
                formData.append(key, characterData[key]);
            }
        });
        
        // 이미지 파일 추가
        if (characterData.image) {
            formData.append('image', characterData.image);
        }
        
        const response = await fetch(`${API_BASE_URL}/characters`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '캐릭터 생성 실패');
        }
        
        await loadCharacters();
        return await response.json();
    } catch (error) {
        console.error('캐릭터 생성 실패:', error);
        throw error;
    }
}

async function updateCharacter(id, characterData) {
    try {
        const formData = new FormData();
        
        // 텍스트 데이터 추가
        Object.keys(characterData).forEach(key => {
            if (key !== 'image' && characterData[key] !== null) {
                formData.append(key, characterData[key]);
            }
        });
        
        // 이미지 파일 추가
        if (characterData.image) {
            formData.append('image', characterData.image);
        }
        
        const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '캐릭터 수정 실패');
        }
        
        await loadCharacters();
        return await response.json();
    } catch (error) {
        console.error('캐릭터 수정 실패:', error);
        throw error;
    }
}

async function deleteCharacter(id) {
    try {
        const response = await apiCall(`/characters/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        await loadCharacters();
        return response;
    } catch (error) {
        console.error('캐릭터 삭제 실패:', error);
        throw error;
    }
}

// 설정 관련 API 함수들
async function loadSettings() {
    try {
        const response = await apiCall('/settings', {
            headers: getAuthHeaders()
        });
        settings = response;
        updateSettingsMenu();
        return response;
    } catch (error) {
        console.error('설정 로드 실패:', error);
        return [];
    }
}

async function createSetting(settingData) {
    try {
        const response = await apiCall('/settings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(settingData)
        });
        
        await loadSettings();
        return response;
    } catch (error) {
        console.error('설정 생성 실패:', error);
        throw error;
    }
}

async function updateSetting(id, settingData) {
    try {
        const response = await apiCall(`/settings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settingData)
        });
        
        await loadSettings();
        return response;
    } catch (error) {
        console.error('설정 수정 실패:', error);
        throw error;
    }
}

async function deleteSetting(id) {
    try {
        const response = await apiCall(`/settings/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        await loadSettings();
        return response;
    } catch (error) {
        console.error('설정 삭제 실패:', error);
        throw error;
    }
}

// 캐릭터 메뉴 업데이트
function updateCharacterMenu() {
    const menu = document.getElementById('characters-menu');
    if (!menu) return;
    
    menu.innerHTML = '';
    
    characters.forEach(character => {
        const li = document.createElement('li');
        li.className = 'character-item';
        li.dataset.character = character.id;
        
        li.innerHTML = `
            <i class="fas fa-user"></i> ${character.name}
            <div class="character-actions">
                <button class="edit-btn" data-character="${character.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-character="${character.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        menu.appendChild(li);
    });
    
    // 첫 번째 캐릭터를 활성화
    if (menu.children.length > 0) {
        menu.children[0].classList.add('active');
        renderCharacter(characters[0].id);
    }
}

// 설정 메뉴 업데이트
function updateSettingsMenu() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (!settingsMenu) return;
    
    settingsMenu.innerHTML = '';
    
    settings.forEach(setting => {
        const li = document.createElement('li');
        li.className = 'settings-item';
        li.dataset.setting = setting.id;
        
        li.innerHTML = `
            <i class="${setting.icon || 'fas fa-cog'}"></i> ${setting.title}
            <div class="settings-actions">
                <button class="edit-settings-btn" data-setting="${setting.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-settings-btn" data-setting="${setting.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        settingsMenu.appendChild(li);
    });
    
    // 첫 번째 아이템을 활성화
    if (settingsMenu.children.length > 0) {
        settingsMenu.children[0].classList.add('active');
        updateSettingsInfo(settings[0].id);
    }
}

// 캐릭터 렌더링
function renderCharacter(characterId) {
    const character = characters.find(c => c.id == characterId);
    const characterInfo = document.getElementById('character-info');
    
    if (!character) {
        characterInfo.innerHTML = `
            <div class="character-placeholder">
                <i class="fas fa-user-circle"></i>
                <p>캐릭터를 선택하면 상세 정보가 표시됩니다</p>
            </div>
        `;
        return;
    }
    
    // 부드러운 전환 효과
    const existingResume = characterInfo.querySelector('.character-resume');
    if (existingResume) {
        existingResume.classList.add('page-turn');
        setTimeout(() => {
            renderCharacterContent(character, characterInfo);
        }, 300);
    } else {
        renderCharacterContent(character, characterInfo);
    }
}

function renderCharacterContent(character, characterInfo) {
    const imageUrl = character.image_url ? `${API_BASE_URL.replace('/api', '')}${character.image_url}` : null;
    
    characterInfo.innerHTML = `
        <div class="character-resume">
            <div class="resume-header">
                <div class="resume-title">${character.name}</div>
                <div class="resume-subtitle">${character.title || ''}</div>
            </div>
            
            <div class="basic-info">
                <div class="contact-info">
                    <div class="profile-photo">
                        ${imageUrl ? 
                            `<img src="${imageUrl}" alt="${character.name}">` : 
                            `<div class="profile-photo-placeholder">
                                <i class="fas fa-user"></i>
                                <span>Photo</span>
                             </div>`
                        }
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-birthday-cake"></i>
                        <strong>Age:</strong> ${character.age || ''}
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-briefcase"></i>
                        <strong>Role:</strong> ${character.occupation || ''}
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-users"></i>
                        <strong>Team:</strong> ${character.team || 'Usual Saviors'}
                    </div>

                </div>
                
                <div class="summary">
                    <h3 style="color: #1f2937; margin-bottom: 12px; font-size: 1rem; font-weight: 600;">Profile Summary</h3>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.personality || ''}
                    </p>
                </div>
            </div>
            
            <div class="personality-background">
                <div class="personality-box">
                    <div class="section-title">Personality</div>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.personality || ''}
                    </p>
                </div>
                
                <div class="background-box">
                    <div class="section-title">Background</div>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.background || ''}
                    </p>
                </div>
            </div>
            
            <div class="skills-relationships">
                <div class="skills-box">
                    <div class="section-title">Abilities</div>
                    <ul class="skills-list">
                        ${(character.abilities || []).map(ability => `<li>${ability}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="relationships-box">
                    <div class="section-title">Relationships</div>
                    <ul class="relationships-list">
                        ${(character.relationships || []).map(relationship => `<li>${relationship}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="page-number">01</div>
        </div>
    `;
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
        const resume = characterInfo.querySelector('.character-resume');
        if (resume) {
            resume.classList.remove('page-turn');
        }
    }, 600);
}

// 설정 정보 업데이트
function updateSettingsInfo(settingId) {
    const settingsInfo = document.getElementById('settings-info');
    const setting = settings.find(s => s.id == settingId);
    
    if (setting && settingsInfo) {
        const detailsList = (setting.details || []).map(detail => `<li>${detail}</li>`).join('');
        
        settingsInfo.innerHTML = `
            <div class="setting-card">
                <h3>${setting.title}</h3>
                <p><strong>설명:</strong> ${setting.description || ''}</p>
                <p><strong>주요 특징:</strong></p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    ${detailsList}
                </ul>
            </div>
        `;
    }
}

// 모달 관련 함수들
function createCharacterModal() {
    const modal = document.createElement('div');
    modal.className = 'character-modal';
    modal.id = 'character-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>캐릭터 편집</h3>
                <button class="close-btn" onclick="closeCharacterModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form id="character-form">
                <div class="form-group">
                    <label for="char-name">이름</label>
                    <input type="text" id="char-name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="char-title">직함</label>
                    <input type="text" id="char-title" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="char-age">나이</label>
                    <input type="text" id="char-age" name="age" required>
                </div>
                
                <div class="form-group">
                    <label for="char-occupation">직업</label>
                    <input type="text" id="char-occupation" name="occupation" required>
                </div>
                
                <div class="form-group">
                    <label for="char-team">팀</label>
                    <input type="text" id="char-team" name="team" placeholder="예: Usual Saviors">
                </div>
                
                <div class="form-group">
                    <label for="char-personality">성격</label>
                    <textarea id="char-personality" name="personality" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="char-background">배경</label>
                    <textarea id="char-background" name="background" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="char-abilities">능력 (줄바꿈으로 구분)</label>
                    <textarea id="char-abilities" name="abilities" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="char-relationships">관계 (줄바꿈으로 구분)</label>
                    <textarea id="char-relationships" name="relationships" required></textarea>
                </div>
                
                <div class="form-group">
                    <label>프로필 이미지</label>
                    <div class="image-upload" onclick="document.getElementById('char-image').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>이미지를 클릭하여 업로드하세요</p>
                        <input type="file" id="char-image" name="image" accept="image/*" style="display: none;">
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeCharacterModal()">취소</button>
                    <button type="submit" class="btn btn-primary">저장</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'settings-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>설정 카드 추가</h3>
                <button class="close-btn" onclick="closeSettingsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <form id="settings-form">
                <div class="form-group">
                    <label for="setting-title">카테고리 제목</label>
                    <input type="text" id="setting-title" name="title" required placeholder="예: 새로운 마법">
                </div>
                
                <div class="form-group">
                    <label for="setting-description">설명</label>
                    <textarea id="setting-description" name="description" required placeholder="카테고리에 대한 간단한 설명을 입력하세요"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="setting-details">상세 내용 (줄바꿈으로 구분)</label>
                    <textarea id="setting-details" name="details" required placeholder="각 줄에 하나씩 상세 내용을 입력하세요&#10;예:&#10;기능 1: 설명&#10;기능 2: 설명"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="setting-icon">아이콘 선택</label>
                    <select id="setting-icon" name="icon" required>
                        <option value="fas fa-magic">마법 (마법봉)</option>
                        <option value="fas fa-microchip">기술 (칩)</option>
                        <option value="fas fa-city">도시 (건물)</option>
                        <option value="fas fa-skull">위협 (해골)</option>
                        <option value="fas fa-users-cog">조직 (사람들)</option>
                        <option value="fas fa-book">지식 (책)</option>
                        <option value="fas fa-shield-alt">방어 (방패)</option>
                        <option value="fas fa-sword">무기 (검)</option>
                        <option value="fas fa-gem">보석 (보석)</option>
                        <option value="fas fa-star">별 (별)</option>
                    </select>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeSettingsModal()">취소</button>
                    <button type="submit" class="btn btn-primary">추가</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function openCharacterModal(characterId = null) {
    const modal = document.getElementById('character-modal');
    const form = document.getElementById('character-form');
    
    if (characterId) {
        const character = characters.find(c => c.id == characterId);
        if (character) {
            form.name.value = character.name;
            form.title.value = character.title || '';
            form.age.value = character.age || '';
            form.occupation.value = character.occupation || '';
            form.team.value = character.team || '';
            form.personality.value = character.personality || '';
            form.background.value = character.background || '';
            form.abilities.value = (character.abilities || []).join('\n');
            form.relationships.value = (character.relationships || []).join('\n');
            
            form.dataset.characterId = characterId;
        }
    } else {
        form.reset();
        delete form.dataset.characterId;
    }
    
    modal.style.display = 'block';
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    modal.style.display = 'none';
}

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const form = document.getElementById('settings-form');
    
    form.reset();
    modal.style.display = 'block';
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none';
}

function openSettingsEditModal(settingId) {
    const modal = document.getElementById('settings-modal');
    const form = document.getElementById('settings-form');
    const setting = settings.find(s => s.id == settingId);
    
    if (setting) {
        form.title.value = setting.title;
        form.description.value = setting.description || '';
        form.details.value = (setting.details || []).join('\n');
        form.icon.value = setting.icon || 'fas fa-cog';
        form.dataset.editKey = settingId;
    }
    
    modal.style.display = 'block';
}

// 네비게이션 기능
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 링크에서 active 클래스 제거
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 클릭된 링크에 active 클래스 추가
            this.classList.add('active');
            
            // 모든 섹션 숨기기
            sections.forEach(section => section.classList.remove('active'));
            
            // 해당 섹션 보이기
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
}

// 모바일 햄버거 메뉴
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // 메뉴 링크 클릭 시 모바일 메뉴 닫기
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // API 기본 URL 설정 (환경에 따라 동적 설정)
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api'
        : `${window.location.protocol}//${window.location.hostname}/api`;

    // 네비게이션 기능
    initNavigation();
    
    // 모바일 햄버거 메뉴
    initMobileMenu();
    
    // 모달 생성
    createCharacterModal();
    createSettingsModal();
    
    // 설정 사이드바에 추가 버튼 추가
    const settingsSidebar = document.querySelector('.settings-sidebar h3');
    if (settingsSidebar) {
        const addButton = document.createElement('button');
        addButton.id = 'add-settings-btn';
        addButton.className = 'add-settings-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i> 카드 추가';
        settingsSidebar.parentNode.insertBefore(addButton, settingsSidebar.nextSibling);
    }
    
    // 캐릭터 메뉴 클릭 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.closest('.character-item')) {
            const characterItem = e.target.closest('.character-item');
            const characterId = characterItem.dataset.character;
            
            // 로딩 효과 시작
            const characterInfo = document.getElementById('character-info');
            const existingResume = characterInfo.querySelector('.character-resume');
            if (existingResume) {
                existingResume.classList.add('loading');
            }
            
            // 활성 상태 변경
            document.querySelectorAll('.character-item').forEach(item => {
                item.classList.remove('active');
            });
            characterItem.classList.add('active');
            
            // 약간의 지연 후 캐릭터 정보 렌더링
            setTimeout(() => {
                renderCharacter(characterId);
            }, 200);
        }
        
        // 편집 버튼 클릭
        if (e.target.closest('.edit-btn')) {
            const editBtn = e.target.closest('.edit-btn');
            const characterId = editBtn.dataset.character;
            openCharacterModal(characterId);
        }
        
        // 삭제 버튼 클릭
        if (e.target.closest('.delete-btn')) {
            const deleteBtn = e.target.closest('.delete-btn');
            const characterId = deleteBtn.dataset.character;
            if (confirm('정말로 이 캐릭터를 삭제하시겠습니까?')) {
                deleteCharacter(characterId);
            }
        }
        
        // 캐릭터 추가 버튼 클릭
        if (e.target.closest('#add-character-btn')) {
            openCharacterModal();
        }
        
        // 설정 아이템 클릭
        if (e.target.closest('.settings-item')) {
            const settingsItem = e.target.closest('.settings-item');
            const settingId = settingsItem.dataset.setting;
            
            // 모든 아이템에서 active 클래스 제거
            document.querySelectorAll('.settings-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 클릭된 아이템에 active 클래스 추가
            settingsItem.classList.add('active');
            
            // 설정 정보 업데이트
            updateSettingsInfo(settingId);
        }
        
        // 설정 편집 버튼 클릭
        if (e.target.closest('.edit-settings-btn')) {
            const editBtn = e.target.closest('.edit-settings-btn');
            const settingId = editBtn.dataset.setting;
            openSettingsEditModal(settingId);
        }
        
        // 설정 삭제 버튼 클릭
        if (e.target.closest('.delete-settings-btn')) {
            const deleteBtn = e.target.closest('.delete-settings-btn');
            const settingId = deleteBtn.dataset.setting;
            if (confirm('정말로 이 설정을 삭제하시겠습니까?')) {
                deleteSetting(settingId);
            }
        }
        
        // 설정 추가 버튼 클릭
        if (e.target.closest('#add-settings-btn')) {
            openSettingsModal();
        }
    });
    
    // 캐릭터 폼 제출 이벤트
    document.getElementById('character-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const characterId = e.target.dataset.characterId;
        
        const characterData = {
            name: formData.get('name'),
            title: formData.get('title'),
            age: formData.get('age'),
            occupation: formData.get('occupation'),
            team: formData.get('team'),
            personality: formData.get('personality'),
            background: formData.get('background'),
            abilities: formData.get('abilities'),
            relationships: formData.get('relationships'),
            image: formData.get('image')
        };
        
        try {
            if (characterId) {
                await updateCharacter(characterId, characterData);
            } else {
                await createCharacter(characterData);
            }
            
            closeCharacterModal();
            
            // 성공 메시지 표시
            alert(characterId ? '캐릭터가 수정되었습니다.' : '캐릭터가 생성되었습니다.');
        } catch (error) {
            alert('오류가 발생했습니다: ' + error.message);
        }
    });
    
    // 설정 폼 제출 이벤트
    document.getElementById('settings-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const editKey = e.target.dataset.editKey;
        
        const settingData = {
            title: formData.get('title'),
            description: formData.get('description'),
            details: formData.get('details'),
            icon: formData.get('icon')
        };
        
        try {
            if (editKey) {
                await updateSetting(editKey, settingData);
            } else {
                await createSetting(settingData);
            }
            
            closeSettingsModal();
            
            // 성공 메시지 표시
            alert(editKey ? '설정이 수정되었습니다.' : '설정이 생성되었습니다.');
        } catch (error) {
            alert('오류가 발생했습니다: ' + error.message);
        }
        
        // 폼 초기화
        delete e.target.dataset.editKey;
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('character-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCharacterModal();
        }
    });
    
    document.getElementById('settings-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });
    
    // 초기 데이터 로드
    loadCharacters();
    loadSettings();
});

// 스크롤 이벤트 - 네비게이션 바 스타일 변경
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 37, 47, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.4)';
    } else {
        navbar.style.background = 'rgba(26, 37, 47, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    }
});

// 페이지 로드 애니메이션
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
});

// 마우스 위치 추적 (선택적 기능)
document.addEventListener('mousemove', function(e) {
    const x = e.clientX;
    const y = e.clientY;
    document.body.style.setProperty('--mouse-x', x);
    document.body.style.setProperty('--mouse-y', y);
}); 