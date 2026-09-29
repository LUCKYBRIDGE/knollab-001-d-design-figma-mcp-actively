const app = document.getElementById('app');
const progress = document.getElementById('progress');
const liveRegion = document.getElementById('live-region');

const drinks = [
  { id: 'americano', name: '아메리카노', price: 3500, color: '#6d4d3d' },
  { id: 'latte', name: '카페라떼', price: 4000, color: '#b9825a' },
  { id: 'choco', name: '초코라떼', price: 4200, color: '#7a513c' },
  { id: 'peach', name: '복숭아 아이스티', price: 3800, color: '#d99473' }
];

const temperatures = [
  { id: 'hot', name: '따뜻하게', detail: '따뜻한 음료로 주문합니다.' },
  { id: 'iced', name: '차갑게', detail: '얼음이 들어간 차가운 음료로 주문합니다.' }
];

const sizes = [
  { id: 'small', name: '작게', detail: '한 잔을 가볍게' },
  { id: 'medium', name: '보통', detail: '가장 기본 크기' },
  { id: 'large', name: '크게', detail: '조금 더 많이' }
];

const state = {
  step: 0,
  drink: null,
  temperature: null,
  size: null,
  notice: ''
};

const stepLabels = ['시작', '1 / 4 · 음료', '2 / 4 · 온도', '3 / 4 · 크기', '4 / 4 · 확인', '완료'];

function formatPrice(value) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function announce(message) {
  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 20);
}

function selectedDrink() {
  return drinks.find(item => item.id === state.drink);
}

function selectedTemperature() {
  return temperatures.find(item => item.id === state.temperature);
}

function selectedSize() {
  return sizes.find(item => item.id === state.size);
}

function getOrderPhrase() {
  const drink = selectedDrink();
  const temp = selectedTemperature();
  const size = selectedSize();
  if (!drink || !temp || !size) return '';

  const temperatureWord = temp.id === 'iced' ? '아이스' : '따뜻한';
  return `${temperatureWord} ${drink.name} ${size.name} 크기 하나 주세요.`;
}

function resetState() {
  state.step = 0;
  state.drink = null;
  state.temperature = null;
  state.size = null;
  state.notice = '';
  render();
  announce('처음 화면으로 돌아왔습니다.');
}

function goToStep(step) {
  state.notice = '';
  state.step = step;
  render();
}

function renderTitle(title, copy, centered = false) {
  return `
    <div class="title-block${centered ? ' title-block--center' : ''}">
      <h1 class="screen-title">${title}</h1>
      <p class="screen-copy">${copy}</p>
    </div>
  `;
}

function renderNotice() {
  return state.notice ? `<div class="notice" role="alert">${state.notice}</div>` : '';
}

function renderCurrentSelection(label, value) {
  return `
    <div class="current-selection" aria-label="현재 선택">
      <span class="current-selection__label">${label}</span>
      <span class="current-selection__value">${value}</span>
    </div>
  `;
}

function renderActionRow(primaryLabel, primaryAction, secondaryLabel = '', secondaryAction = '') {
  return `
    <div class="action-row">
      ${secondaryLabel ? `<button class="button button--secondary" type="button" data-action="${secondaryAction}">${secondaryLabel}</button>` : ''}
      <button class="button button--primary" type="button" data-action="${primaryAction}">${primaryLabel}</button>
    </div>
  `;
}

function renderStart() {
  return `
    <section class="screen screen--center" aria-labelledby="screen-title">
      <div class="hero-symbol" aria-hidden="true">☕</div>
      <div class="title-block title-block--center">
        <h1 id="screen-title" class="screen-title">카페에서 주문하는 연습을 해봐요</h1>
        <p class="screen-copy">음료를 고르고, 주문 내용을 확인한 뒤 주문을 마칩니다.</p>
      </div>
      <button class="button button--primary" type="button" data-action="start">연습 시작하기</button>
    </section>
  `;
}

function renderDrinkStep() {
  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderTitle('어떤 음료를 주문할까요?', '원하는 음료를 하나 선택하세요.')}
      <div class="choice-grid" role="group" aria-label="음료 선택">
        ${drinks.map(drink => {
          const selected = state.drink === drink.id;
          return `
            <button class="choice-card${selected ? ' is-selected' : ''}" type="button" data-select="drink" data-value="${drink.id}" aria-pressed="${selected}">
              <span class="choice-card__visual" style="--drink-color:${drink.color}" aria-hidden="true"></span>
              <span class="choice-card__name">${drink.name}</span>
              <span class="choice-card__detail">${formatPrice(drink.price)}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderNotice()}
      ${renderActionRow('다음으로', 'next-drink', '처음으로', 'restart')}
    </section>
  `;
}

function renderTemperatureStep() {
  const drink = selectedDrink();
  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderCurrentSelection('선택한 음료', drink?.name || '')}
      ${renderTitle('따뜻하게 드릴까요, 차갑게 드릴까요?', '원하는 온도를 하나 선택하세요.')}
      <div class="choice-grid" role="group" aria-label="온도 선택">
        ${temperatures.map(item => {
          const selected = state.temperature === item.id;
          return `
            <button class="choice-card choice-card--simple${selected ? ' is-selected' : ''}" type="button" data-select="temperature" data-value="${item.id}" aria-pressed="${selected}">
              <span class="choice-card__name">${item.name}</span>
              <span class="choice-card__detail">${item.detail}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderNotice()}
      ${renderActionRow('다음으로', 'next-temperature', '이전으로', 'back-drink')}
    </section>
  `;
}

function renderSizeStep() {
  const drink = selectedDrink();
  const temp = selectedTemperature();
  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderCurrentSelection('현재 선택', `${drink?.name || ''} · ${temp?.name || ''}`)}
      ${renderTitle('크기를 골라주세요.', '원하는 크기를 하나 선택하세요.')}
      <div class="choice-grid choice-grid--three" role="group" aria-label="크기 선택">
        ${sizes.map(item => {
          const selected = state.size === item.id;
          return `
            <button class="choice-card choice-card--simple${selected ? ' is-selected' : ''}" type="button" data-select="size" data-value="${item.id}" aria-pressed="${selected}">
              <span class="choice-card__name">${item.name}</span>
              <span class="choice-card__detail">${item.detail}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderNotice()}
      ${renderActionRow('주문 확인하기', 'next-size', '이전으로', 'back-temperature')}
    </section>
  `;
}

function renderReviewRow(label, value, action) {
  return `
    <div class="review-row">
      <div class="review-row__main">
        <span class="review-row__label">${label}</span>
        <span class="review-row__value">${value}</span>
      </div>
      <button class="edit-button" type="button" data-action="${action}" aria-label="${label} 바꾸기">바꾸기</button>
    </div>
  `;
}

function renderReviewStep() {
  const drink = selectedDrink();
  const temp = selectedTemperature();
  const size = selectedSize();
  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderTitle('주문이 맞나요?', '선택한 내용을 확인한 뒤 주문하세요.')}
      <div class="review-card" aria-label="주문 내용">
        ${renderReviewRow('음료', drink?.name || '', 'edit-drink')}
        ${renderReviewRow('온도', temp?.name || '', 'edit-temperature')}
        ${renderReviewRow('크기', size?.name || '', 'edit-size')}
        <div class="review-total">
          <span>결제할 금액</span>
          <span class="review-total__price">${drink ? formatPrice(drink.price) : ''}</span>
        </div>
      </div>
      ${renderActionRow('네, 주문할게요', 'complete-order', '이전으로', 'back-size')}
    </section>
  `;
}

function renderComplete() {
  const drink = selectedDrink();
  const temp = selectedTemperature();
  const size = selectedSize();
  return `
    <section class="screen screen--center" aria-labelledby="screen-title">
      <div class="complete-symbol" aria-hidden="true">✓</div>
      <div class="title-block title-block--center">
        <h1 id="screen-title" class="screen-title">주문 연습을 마쳤어요</h1>
        <p class="screen-copy">${drink?.name || ''} · ${temp?.name || ''} · ${size?.name || ''}</p>
      </div>
      <div class="order-phrase">
        <span class="order-phrase__label">카페에서 이렇게 말할 수 있어요.</span>
        <span class="order-phrase__text">“${getOrderPhrase()}”</span>
      </div>
      <button class="button button--primary" type="button" data-action="restart">다시 연습하기</button>
    </section>
  `;
}

function render() {
  progress.textContent = stepLabels[state.step];

  const screens = [
    renderStart,
    renderDrinkStep,
    renderTemperatureStep,
    renderSizeStep,
    renderReviewStep,
    renderComplete
  ];

  app.innerHTML = screens[state.step]();
  app.focus({ preventScroll: true });
}

function requireSelection(key, message) {
  if (state[key]) return true;
  state.notice = message;
  render();
  announce(message);
  return false;
}

app.addEventListener('click', event => {
  const selectButton = event.target.closest('[data-select]');
  if (selectButton) {
    const kind = selectButton.dataset.select;
    const value = selectButton.dataset.value;
    state[kind] = value;
    state.notice = '';
    render();

    if (kind === 'drink') announce(`${selectedDrink().name}을 선택했습니다.`);
    if (kind === 'temperature') announce(`${selectedTemperature().name}를 선택했습니다.`);
    if (kind === 'size') announce(`${selectedSize().name} 크기를 선택했습니다.`);
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  switch (actionButton.dataset.action) {
    case 'start':
      goToStep(1);
      announce('음료 선택 단계입니다.');
      break;
    case 'restart':
      resetState();
      break;
    case 'next-drink':
      if (requireSelection('drink', '먼저 음료를 하나 선택하세요.')) {
        goToStep(2);
        announce('온도 선택 단계입니다.');
      }
      break;
    case 'next-temperature':
      if (requireSelection('temperature', '먼저 온도를 하나 선택하세요.')) {
        goToStep(3);
        announce('크기 선택 단계입니다.');
      }
      break;
    case 'next-size':
      if (requireSelection('size', '먼저 크기를 하나 선택하세요.')) {
        goToStep(4);
        announce('주문 확인 단계입니다.');
      }
      break;
    case 'complete-order':
      goToStep(5);
      announce('주문 연습을 마쳤습니다.');
      break;
    case 'back-drink':
    case 'edit-drink':
      goToStep(1);
      break;
    case 'back-temperature':
    case 'edit-temperature':
      goToStep(2);
      break;
    case 'back-size':
    case 'edit-size':
      goToStep(3);
      break;
  }
});

document.addEventListener('click', event => {
  const restartLink = event.target.closest('.brand[data-action="restart"]');
  if (!restartLink) return;
  event.preventDefault();
  resetState();
});

render();