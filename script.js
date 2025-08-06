// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 네비게이션 기능
    initNavigation();
    
    // 설정 메뉴 기능
    initSettingsMenu();
    
    // 모바일 햄버거 메뉴
    initMobileMenu();
    
    // 캐릭터 모달 생성
    createCharacterModal();
    
    // 설정 모달 생성
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
        
        // 캐릭터 추가 버튼 클릭
        if (e.target.closest('#add-character-btn')) {
            openCharacterModal();
        }
    });
    
    // 캐릭터 폼 제출 이벤트
    document.getElementById('character-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const characterId = e.target.dataset.characterId || 'character' + (Object.keys(characters).length + 1);
        
        // 이미지 처리
        const imageFile = formData.get('image');
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            imageUrl = URL.createObjectURL(imageFile);
        }
        
        // 캐릭터 데이터 업데이트
        characters[characterId] = {
            name: formData.get('name'),
            title: formData.get('title'),
            age: formData.get('age'),
            occupation: formData.get('occupation'),
            personality: formData.get('personality'),
            background: formData.get('background'),
            abilities: formData.get('abilities').split('\n').filter(ability => ability.trim()),
            relationships: formData.get('relationships').split('\n').filter(relationship => relationship.trim()),
            image: imageUrl
        };
        
        // 메뉴 업데이트
        updateCharacterMenu();
        
        // 모달 닫기
        closeCharacterModal();
        
        // 현재 캐릭터 다시 렌더링
        const activeCharacter = document.querySelector('.character-item.active');
        if (activeCharacter && activeCharacter.dataset.character === characterId) {
            renderCharacter(characterId);
        }
    });
    
    // 설정 폼 제출 이벤트
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const editKey = e.target.dataset.editKey;
        const settingKey = editKey || 'setting-' + (Object.keys(settings).length + 1);
        
        // 설정 데이터 업데이트
        settings[settingKey] = {
            title: formData.get('title'),
            description: formData.get('description'),
            details: formData.get('details').split('\n').filter(detail => detail.trim()),
            icon: formData.get('icon')
        };
        
        // 메뉴 업데이트
        updateSettingsMenu();
        
        // 모달 닫기
        closeSettingsModal();
        
        // 편집 모드였다면 해당 설정을 활성화
        if (editKey) {
            document.querySelectorAll('.settings-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeItem = document.querySelector(`[data-setting="${settingKey}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                updateSettingsInfo(settingKey);
            }
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
    
    // 초기 캐릭터 렌더링
    renderCharacter('character1');
});

// 캐릭터 데이터 구조
let characters = {
    character1: {
        name: "캐릭터 1",
        title: "주인공",
        age: "25세",
        occupation: "대학생",
        personality: "정의감이 강하고 호기심이 많은 성격",
        background: "평범한 대학생이었지만 우연한 사고로 각성하게 되었다.",
        abilities: ["초능력 각성", "이형 감지", "기본 마법"],
        relationships: ["가족들과 평범한 관계", "동료들과 친밀함"],
        image: null
    },
    character2: {
        name: "캐릭터 2",
        title: "마법사",
        age: "30세",
        occupation: "마법 연구원",
        personality: "차분하고 분석적인 성격",
        background: "어린 시절부터 마법에 재능을 보였던 천재 마법사",
        abilities: ["고급 마법", "마법 연구", "이형 분석"],
        relationships: ["연구소 동료들과 협력 관계", "제자들과 스승-제자 관계"],
        image: null
    },
    character3: {
        name: "캐릭터 3",
        title: "기술자",
        age: "28세",
        occupation: "발명가",
        personality: "창의적이고 실험적인 성격",
        background: "기술과 마법을 결합한 혁신적인 발명품을 만드는 천재",
        abilities: ["기술 마법", "발명", "장비 제작"],
        relationships: ["발명품 거래상들과 비즈니스 관계", "동료 발명가들과 경쟁 관계"],
        image: null
    },
    character4: {
        name: "캐릭터 4",
        title: "악역",
        age: "??",
        occupation: "이형사냥꾼",
        personality: "냉혹하고 목적지향적인 성격",
        background: "과거의 상처로 인해 인간을 불신하게 된 이형사냥꾼",
        abilities: ["고급 전투술", "이형 조종", "어둠의 마법"],
        relationships: ["동료들과 불신 관계", "적들과 적대 관계"],
        image: null
    }
};

// 설정 데이터 - 동적으로 수정 가능하도록 변경
let settings = {
    'magic-system': {
        title: '마법 체계',
        description: '이형세계의 마법과 인간의 각성 능력에 대한 체계적인 설명',
        details: [
            '신앙 마법: 인간의 믿음에서 비롯되는 신족의 힘',
            '이형 마법: 이형들이 사용하는 초자연적 능력',
            '각성 능력: 인간이 각성으로 얻는 특별한 힘',
            '기술 마법: 현대 기술과 마법의 결합'
        ]
    },
    'technology': {
        title: '기술',
        description: '현실보다 한 단계 발전된 근미래 기술들',
        details: [
            '양자 컴퓨터: 상용화된 고성능 컴퓨팅',
            '상온 초전도체: 에너지 효율성 극대화',
            '제한적 반중력: 일부 분야에서 활용',
            '이형 기술: 이형세계의 기술과의 융합'
        ]
    },
    'city': {
        title: '도시 구조',
        description: '현실과 이형세계가 공존하는 도시의 구조',
        details: [
            '표면 세계: 일반인들이 살아가는 평범한 도시',
            '이형 구역: 이형들이 은밀히 활동하는 지역',
            '각성자 거주지: 각성자들이 모여사는 특별 구역',
            '이형사냥꾼 본부: 이형 관리 조직의 거점'
        ]
    },
    'threats': {
        title: '위협 요소',
        description: '세계를 위협하는 다양한 위험 요소들',
        details: [
            '이형의 침입: 이형세계에서 넘어오는 위협',
            '각성자 남용: 각성 능력을 악용하는 자들',
            '신앙 분쟁: 신족들 간의 경쟁과 갈등',
            '세계 멸망: 대규모 재앙의 위험'
        ]
    },
    'organizations': {
        title: '조직들',
        description: '세계의 균형을 유지하는 주요 조직들',
        details: [
            '이형사냥꾼: 이형을 관리하는 전문 조직',
            '각성자 연합: 각성자들의 자조 단체',
            '신앙 관리국: 신앙 관련 정부 기관',
            '이형 연구소: 이형과 마법을 연구하는 기관'
        ]
    }
};

// 설정 카드 추가 모달 생성
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

// 설정 모달 열기
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const form = document.getElementById('settings-form');
    
    form.reset();
    modal.style.display = 'block';
}

// 설정 모달 닫기
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none';
}

// 설정 메뉴 업데이트
function updateSettingsMenu() {
    const settingsMenu = document.querySelector('.settings-menu');
    if (!settingsMenu) return;
    
    settingsMenu.innerHTML = '';
    
    Object.keys(settings).forEach(settingKey => {
        const setting = settings[settingKey];
        const li = document.createElement('li');
        li.className = 'settings-item';
        li.dataset.setting = settingKey;
        
        // 아이콘 결정 (기존 아이콘 매핑)
        let iconClass = 'fas fa-cog'; // 기본 아이콘
        if (settingKey === 'magic-system') iconClass = 'fas fa-magic';
        else if (settingKey === 'technology') iconClass = 'fas fa-microchip';
        else if (settingKey === 'city') iconClass = 'fas fa-city';
        else if (settingKey === 'threats') iconClass = 'fas fa-skull';
        else if (settingKey === 'organizations') iconClass = 'fas fa-users-cog';
        else if (setting.icon) iconClass = setting.icon; // 새로 추가된 카드의 아이콘
        
        li.innerHTML = `
            <i class="${iconClass}"></i> ${setting.title}
            <button class="edit-settings-btn" data-setting="${settingKey}">
                <i class="fas fa-edit"></i>
            </button>
        `;
        
        settingsMenu.appendChild(li);
    });
    
    // 첫 번째 아이템을 활성화
    if (settingsMenu.children.length > 0) {
        settingsMenu.children[0].classList.add('active');
        const firstSettingKey = Object.keys(settings)[0];
        updateSettingsInfo(firstSettingKey);
    }
}

// 설정 정보 업데이트
function updateSettingsInfo(settingKey) {
    const settingsInfo = document.getElementById('settings-info');
    const setting = settings[settingKey];
    
    if (setting && settingsInfo) {
        const detailsList = setting.details.map(detail => `<li>${detail}</li>`).join('');
        
        settingsInfo.innerHTML = `
            <div class="setting-card">
                <h3>${setting.title}</h3>
                <p><strong>설명:</strong> ${setting.description}</p>
                <p><strong>주요 특징:</strong></p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    ${detailsList}
                </ul>
            </div>
        `;
    }
}

// 설정 메뉴 기능 - 수정된 버전
function initSettingsMenu() {
    const settingsInfo = document.getElementById('settings-info');
    
    // 초기 설정 표시 (마법 체계)
    if (settingsInfo) {
        const initialSetting = settings['magic-system'];
        const detailsList = initialSetting.details.map(detail => `<li>${detail}</li>`).join('');
        
        settingsInfo.innerHTML = `
            <div class="setting-card">
                <h3>${initialSetting.title}</h3>
                <p><strong>설명:</strong> ${initialSetting.description}</p>
                <p><strong>주요 특징:</strong></p>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    ${detailsList}
                </ul>
            </div>
        `;
    }
    
    // 설정 아이템 클릭 이벤트 (이벤트 위임 사용)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.settings-item')) {
            const settingsItem = e.target.closest('.settings-item');
            const settingKey = settingsItem.dataset.setting;
            
            // 모든 아이템에서 active 클래스 제거
            document.querySelectorAll('.settings-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 클릭된 아이템에 active 클래스 추가
            settingsItem.classList.add('active');
            
            // 설정 정보 업데이트
            updateSettingsInfo(settingKey);
        }
        
        // 설정 편집 버튼 클릭
        if (e.target.closest('.edit-settings-btn')) {
            const editBtn = e.target.closest('.edit-settings-btn');
            const settingKey = editBtn.dataset.setting;
            openSettingsEditModal(settingKey);
        }
        
        // 설정 추가 버튼 클릭
        if (e.target.closest('#add-settings-btn')) {
            openSettingsModal();
        }
    });
}

// 설정 편집 모달 열기
function openSettingsEditModal(settingKey) {
    const modal = document.getElementById('settings-modal');
    const form = document.getElementById('settings-form');
    const setting = settings[settingKey];
    
    if (setting) {
        form.title.value = setting.title;
        form.description.value = setting.description;
        form.details.value = setting.details.join('\n');
        form.icon.value = setting.icon || 'fas fa-cog';
        form.dataset.editKey = settingKey;
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

// 캐릭터 렌더링 함수
function renderCharacter(characterId) {
    const character = characters[characterId];
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
    characterInfo.innerHTML = `
        <div class="character-resume">
            <div class="resume-header">
                <div class="resume-title">${character.name}</div>
                <div class="resume-subtitle">${character.title}</div>
            </div>
            
            <div class="basic-info">
                <div class="contact-info">
                    <div class="profile-photo">
                        ${character.image ? 
                            `<img src="${character.image}" alt="${character.name}">` : 
                            `<div class="profile-photo-placeholder">
                                <i class="fas fa-user"></i>
                                <span>Photo</span>
                             </div>`
                        }
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-birthday-cake"></i>
                        <strong>Age:</strong> ${character.age}
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-briefcase"></i>
                        <strong>Role:</strong> ${character.occupation}
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-users"></i>
                        <strong>Team:</strong> Usual Saviors
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-calendar"></i>
                        <strong>Joined:</strong> ${new Date().toLocaleDateString()}
                    </div>
                </div>
                
                <div class="summary">
                    <h3 style="color: #1f2937; margin-bottom: 12px; font-size: 1rem; font-weight: 600;">Profile Summary</h3>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.personality}
                    </p>
                </div>
            </div>
            
            <div class="personality-background">
                <div class="personality-box">
                    <div class="section-title">Personality</div>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.personality}
                    </p>
                </div>
                
                <div class="background-box">
                    <div class="section-title">Background</div>
                    <p style="color: #4b5563; line-height: 1.6; font-size: 0.9rem;">
                        ${character.background}
                    </p>
                </div>
            </div>
            
            <div class="skills-relationships">
                <div class="skills-box">
                    <div class="section-title">Abilities</div>
                    <ul class="skills-list">
                        ${character.abilities.map(ability => `<li>${ability}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="relationships-box">
                    <div class="section-title">Relationships</div>
                    <ul class="relationships-list">
                        ${character.relationships.map(relationship => `<li>${relationship}</li>`).join('')}
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

// 캐릭터 편집 모달
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

// 모달 열기
function openCharacterModal(characterId = null) {
    const modal = document.getElementById('character-modal');
    const form = document.getElementById('character-form');
    
    if (characterId && characters[characterId]) {
        const character = characters[characterId];
        form.name.value = character.name;
        form.title.value = character.title;
        form.age.value = character.age;
        form.occupation.value = character.occupation;
        form.personality.value = character.personality;
        form.background.value = character.background;
        form.abilities.value = character.abilities.join('\n');
        form.relationships.value = character.relationships.join('\n');
        
        form.dataset.characterId = characterId;
    } else {
        form.reset();
        delete form.dataset.characterId;
    }
    
    modal.style.display = 'block';
}

// 모달 닫기
function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    modal.style.display = 'none';
}

// 캐릭터 메뉴 업데이트
function updateCharacterMenu() {
    const menu = document.getElementById('characters-menu');
    menu.innerHTML = '';
    
    Object.keys(characters).forEach(characterId => {
        const character = characters[characterId];
        const li = document.createElement('li');
        li.className = 'character-item';
        li.dataset.character = characterId;
        
        li.innerHTML = `
            <i class="fas fa-user"></i> ${character.name}
            <button class="edit-btn" data-character="${characterId}">
                <i class="fas fa-edit"></i>
            </button>
        `;
        
        menu.appendChild(li);
    });
    
    // 첫 번째 캐릭터를 활성화
    if (menu.children.length > 0) {
        menu.children[0].classList.add('active');
        renderCharacter(Object.keys(characters)[0]);
    }
}

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