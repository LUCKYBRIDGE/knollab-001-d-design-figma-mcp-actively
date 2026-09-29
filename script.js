const app = document.getElementById('app');
const progress = document.getElementById('progress');
const liveRegion = document.getElementById('live-region');

const drinks = [
  { id: 'americano', name: '아메리카노', price: 3500, color: '#6d4d3d' },
  { id: 'latte', name: '카페라떼', price: 4000, color: '#b9825a' },
  { id: 'choco', name: '초코라떼', price: 4200, color: '#7a513c' },
  { id: 'lemon', name: '레몬티', price: 3800, color: '#d9a15b' }
];

const temperatures = [
  { id: 'hot', name: '따뜻하게', detail: '따뜻한 음료로 주문해요.' },
  { id: 'iced', name: '차갑게', detail: '얼음이 들어간 음료로 주문해요.' }
];

const sizes = [
  { id: 'small', name: '작은 크기', detail: '가볍게 한 잔' },
  { id: 'medium', name: '보통 크기', detail: '기본 크기' },
  { id: 'large', name: '큰 크기', detail: '조금 더 많이' }
];

const services = [
  { id: 'store', name: '매장에서 먹기', detail: '카페 안에서 마셔요.' },
  { id: 'takeout', name: '포장하기', detail: '가지고 나가요.' }
];

const state = {
  step: 0,
  drink: null,
  temperature: null,
  size: null,
  service: null,
  notice: '',
  editing: null,
  editOriginal: null
};

const stepLabels = [
  '시작',
  '1 / 5 · 음료 선택',
  '2 / 5 · 온도 선택',
  '3 / 5 · 크기 선택',
  '4 / 5 · 먹는 방법',
  '5 / 5 · 주문 확인',
  '완료'
];

const editProgressLabels = {
  drink: '1 / 5 · 음료 수정',
  temperature: '2 / 5 · 온도 수정',
  size: '3 / 5 · 크기 수정',
  service: '4 / 5 · 먹는 방법 수정'
};

const editStepMap = {
  drink: 1,
  temperature: 2,
  size: 3,
  service: 4
};

const editFieldNames = {
  drink: '음료',
  temperature: '온도',
  size: '크기',
  service: '먹는 방법'
};

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

function selectedService() {
  return services.find(item => item.id === state.service);
}

function selectedItem(kind) {
  if (kind === 'drink') return selectedDrink();
  if (kind === 'temperature') return selectedTemperature();
  if (kind === 'size') return selectedSize();
  if (kind === 'service') return selectedService();
  return null;
}

function currentOrderSummary(includeService = true) {
  const parts = [
    selectedDrink()?.name,
    selectedTemperature()?.name,
    selectedSize()?.name
  ];
  if (includeService) parts.push(selectedService()?.name);
  return parts.filter(Boolean).join(' · ');
}

function getOrderPhrase() {
  const drink = selectedDrink();
  const temperature = selectedTemperature();
  const size = selectedSize();
  const service = selectedService();
  if (!drink || !temperature || !size || !service) return '';

  const temperatureWord = temperature.id === 'iced' ? '아이스' : '따뜻한';
  const servicePhrase = service.id === 'takeout' ? '포장해 주세요.' : '매장에서 먹을게요.';
  return `${temperatureWord} ${drink.name} ${size.name} 하나, ${servicePhrase}`;
}

function resetState() {
  state.step = 0;
  state.drink = null;
  state.temperature = null;
  state.size = null;
  state.service = null;
  state.notice = '';
  state.editing = null;
  state.editOriginal = null;
  render();
  announce('처음 화면으로 돌아왔습니다.');
}

function goToStep(step) {
  state.notice = '';
  state.step = step;
  render();
}

function beginEdit(kind) {
  state.editing = kind;
  state.editOriginal = state[kind];
  state.notice = '';
  state.step = editStepMap[kind];
  render();
  announce(`${editFieldNames[kind]} 수정 화면입니다.`);
}

function applyEdit() {
  const kind = state.editing;
  if (!kind) return;
  const item = selectedItem(kind);
  state.editing = null;
  state.editOriginal = null;
  state.notice = '';
  state.step = 5;
  render();
  announce(`${editFieldNames[kind]}을 ${item?.name || ''}(으)로 바꾸고 주문 확인으로 돌아왔습니다.`);
}

function cancelEdit() {
  const kind = state.editing;
  if (!kind) return;
  state[kind] = state.editOriginal;
  state.editing = null;
  state.editOriginal = null;
  state.notice = '';
  state.step = 5;
  render();
  announce('변경하지 않고 주문 확인으로 돌아왔습니다.');
}

function renderTitle(title, copy, centered = false) {
  return `
    <div class="title-block${centered ? ' title-block--center' : ''}">
      <h1 id="screen-title" class="screen-title">${title}</h1>
      <p class="screen-copy">${copy}</p>
    </div>
  `;
}

function renderNotice() {
  return state.notice ? `<div class="notice" role="alert">${state.notice}</div>` : '';
}

function renderCurrentSelection(label, value, editing = false) {
  return `
    <div class="current-selection${editing ? ' current-selection--editing' : ''}" aria-label="${label}">
      <span class="current-selection__label">${label}</span>
      <span class="current-selection__value">${value}</span>
    </div>
  `;
}

function renderSelectionHelp(kind) {
  if (state[kind]) return '';
  return '<p class="selection-help">하나를 선택하면 다음으로 갈 수 있어요.</p>';
}

function renderActionRow(primaryLabel, primaryAction, secondaryLabel = '', secondaryAction = '', primaryDisabled = false) {
  return `
    <div class="action-row">
      ${secondaryLabel ? `<button class="button button--secondary" type="button" data-action="${secondaryAction}">${secondaryLabel}</button>` : ''}
      <button class="button button--primary" type="button" data-action="${primaryAction}"${primaryDisabled ? ' disabled' : ''}>${primaryLabel}</button>
    </div>
  `;
}

function renderEditingContext(kind) {
  if (state.editing !== kind) return '';
  return renderCurrentSelection('수정 중', `${editFieldNames[kind]}만 바꾼 뒤 주문 확인으로 돌아가요.`, true);
}

function renderStart() {
  return `
    <section class="screen screen--center" aria-labelledby="screen-title">
      <div class="hero-symbol" aria-hidden="true">☕</div>
      ${renderTitle('카페 주문을 연습해요', '음료를 고르고, 옵션과 먹는 방법을 선택한 뒤 주문을 확인해요.', true)}
      <button class="button button--primary" type="button" data-action="start">연습 시작하기</button>
    </section>
  `;
}

function renderDrinkStep() {
  const editing = state.editing === 'drink';
  const title = editing ? '음료를 바꿀까요?' : '어떤 음료를 주문할까요?';
  const copy = editing ? '다른 음료를 선택한 뒤 변경을 적용하세요.' : '원하는 음료를 하나 선택하세요.';

  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderEditingContext('drink')}
      ${renderTitle(title, copy)}
      <div class="choice-grid choice-grid--drinks" role="group" aria-label="음료 선택">
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
      ${renderSelectionHelp('drink')}
      ${renderNotice()}
      ${editing
        ? renderActionRow('변경 적용', 'apply-edit', '취소', 'cancel-edit', !state.drink)
        : renderActionRow('다음으로', 'next-drink', '처음으로', 'restart', !state.drink)}
    </section>
  `;
}

function renderTemperatureStep() {
  const editing = state.editing === 'temperature';
  const drink = selectedDrink();
  const title = editing ? '온도를 바꿀까요?' : '따뜻하게 드릴까요, 차갑게 드릴까요?';
  const copy = editing ? '다른 온도를 선택한 뒤 변경을 적용하세요.' : '원하는 온도를 하나 선택하세요.';

  return `
    <section class="screen" aria-labelledby="screen-title">
      ${editing
        ? renderEditingContext('temperature')
        : renderCurrentSelection('현재 주문', drink?.name || '')}
      ${renderTitle(title, copy)}
      <div class="choice-grid choice-grid--two" role="group" aria-label="온도 선택">
        ${temperatures.map(item => {
          const selected = state.temperature === item.id;
          return `
            <button class="choice-card${selected ? ' is-selected' : ''}" type="button" data-select="temperature" data-value="${item.id}" aria-pressed="${selected}">
              <span class="choice-card__name">${item.name}</span>
              <span class="choice-card__detail">${item.detail}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderSelectionHelp('temperature')}
      ${renderNotice()}
      ${editing
        ? renderActionRow('변경 적용', 'apply-edit', '취소', 'cancel-edit', !state.temperature)
        : renderActionRow('다음으로', 'next-temperature', '이전으로', 'back-drink', !state.temperature)}
    </section>
  `;
}

function renderSizeStep() {
  const editing = state.editing === 'size';
  const title = editing ? '크기를 바꿀까요?' : '어떤 크기로 할까요?';
  const copy = editing ? '다른 크기를 선택한 뒤 변경을 적용하세요.' : '원하는 크기를 하나 선택하세요.';

  return `
    <section class="screen" aria-labelledby="screen-title">
      ${editing
        ? renderEditingContext('size')
        : renderCurrentSelection('현재 주문', currentOrderSummary(false))}
      ${renderTitle(title, copy)}
      <div class="choice-grid choice-grid--three" role="group" aria-label="크기 선택">
        ${sizes.map(item => {
          const selected = state.size === item.id;
          return `
            <button class="choice-card${selected ? ' is-selected' : ''}" type="button" data-select="size" data-value="${item.id}" aria-pressed="${selected}">
              <span class="choice-card__name">${item.name}</span>
              <span class="choice-card__detail">${item.detail}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderSelectionHelp('size')}
      ${renderNotice()}
      ${editing
        ? renderActionRow('변경 적용', 'apply-edit', '취소', 'cancel-edit', !state.size)
        : renderActionRow('다음으로', 'next-size', '이전으로', 'back-temperature', !state.size)}
    </section>
  `;
}

function renderServiceStep() {
  const editing = state.editing === 'service';
  const title = editing ? '먹는 방법을 바꿀까요?' : '어디에서 마실까요?';
  const copy = editing ? '다른 방법을 선택한 뒤 변경을 적용하세요.' : '매장에서 먹을지, 포장할지 선택하세요.';

  return `
    <section class="screen" aria-labelledby="screen-title">
      ${editing
        ? renderEditingContext('service')
        : renderCurrentSelection('현재 주문', currentOrderSummary(false))}
      ${renderTitle(title, copy)}
      <div class="choice-grid choice-grid--two" role="group" aria-label="먹는 방법 선택">
        ${services.map(item => {
          const selected = state.service === item.id;
          return `
            <button class="choice-card${selected ? ' is-selected' : ''}" type="button" data-select="service" data-value="${item.id}" aria-pressed="${selected}">
              <span class="choice-card__name">${item.name}</span>
              <span class="choice-card__detail">${item.detail}</span>
              ${selected ? '<span class="choice-card__status">✓ 선택됨</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
      ${renderSelectionHelp('service')}
      ${renderNotice()}
      ${editing
        ? renderActionRow('변경 적용', 'apply-edit', '취소', 'cancel-edit', !state.service)
        : renderActionRow('주문 확인하기', 'next-service', '이전으로', 'back-size', !state.service)}
    </section>
  `;
}

function renderReviewRow(label, value, kind) {
  return `
    <div class="review-row">
      <div class="review-row__main">
        <span class="review-row__label">${label}</span>
        <span class="review-row__value">${value}</span>
      </div>
      <button class="edit-button" type="button" data-action="edit-${kind}" aria-label="${label} 바꾸기">바꾸기</button>
    </div>
  `;
}

function renderReviewStep() {
  const drink = selectedDrink();
  const temperature = selectedTemperature();
  const size = selectedSize();
  const service = selectedService();

  return `
    <section class="screen" aria-labelledby="screen-title">
      ${renderTitle('주문이 맞나요?', '선택한 내용을 확인하고, 필요하면 바꾸세요.')}
      <div class="review-card" aria-label="주문 내용">
        ${renderReviewRow('음료', drink?.name || '', 'drink')}
        ${renderReviewRow('온도', temperature?.name || '', 'temperature')}
        ${renderReviewRow('크기', size?.name || '', 'size')}
        ${renderReviewRow('먹는 방법', service?.name || '', 'service')}
        <div class="review-total">
          <span>결제할 금액</span>
          <span class="review-total__price">${drink ? formatPrice(drink.price) : ''}</span>
        </div>
      </div>
      ${renderActionRow('주문하기', 'complete-order', '이전으로', 'back-service')}
    </section>
  `;
}

function renderComplete() {
  return `
    <section class="screen screen--center" aria-labelledby="screen-title">
      <div class="complete-symbol" aria-hidden="true">✓</div>
      ${renderTitle('주문 연습을 마쳤어요', '주문이 정상적으로 완료되었어요.', true)}
      <div class="order-summary-line">${currentOrderSummary(true)}</div>
      <div class="order-phrase">
        <span class="order-phrase__label">카페에서 이렇게 말할 수 있어요.</span>
        <span class="order-phrase__text">“${getOrderPhrase()}”</span>
      </div>
      <button class="button button--primary" type="button" data-action="restart">다시 연습하기</button>
    </section>
  `;
}

function render() {
  progress.textContent = state.editing ? editProgressLabels[state.editing] : stepLabels[state.step];

  const screens = [
    renderStart,
    renderDrinkStep,
    renderTemperatureStep,
    renderSizeStep,
    renderServiceStep,
    renderReviewStep,
    renderComplete
  ];

  app.innerHTML = screens[state.step]();
  app.focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  const selectButton = event.target.closest('[data-select]');
  if (selectButton) {
    const kind = selectButton.dataset.select;
    const value = selectButton.dataset.value;
    state[kind] = value;
    state.notice = '';
    render();

    const item = selectedItem(kind);
    if (item) announce(`${item.name}을 선택했습니다.`);
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
      if (state.drink) {
        goToStep(2);
        announce('온도 선택 단계입니다.');
      }
      break;
    case 'next-temperature':
      if (state.temperature) {
        goToStep(3);
        announce('크기 선택 단계입니다.');
      }
      break;
    case 'next-size':
      if (state.size) {
        goToStep(4);
        announce('먹는 방법 선택 단계입니다.');
      }
      break;
    case 'next-service':
      if (state.service) {
        goToStep(5);
        announce('주문 확인 단계입니다.');
      }
      break;
    case 'complete-order':
      goToStep(6);
      announce('주문 연습을 마쳤습니다.');
      break;
    case 'back-drink':
      goToStep(1);
      break;
    case 'back-temperature':
      goToStep(2);
      break;
    case 'back-size':
      goToStep(3);
      break;
    case 'back-service':
      goToStep(4);
      break;
    case 'edit-drink':
      beginEdit('drink');
      break;
    case 'edit-temperature':
      beginEdit('temperature');
      break;
    case 'edit-size':
      beginEdit('size');
      break;
    case 'edit-service':
      beginEdit('service');
      break;
    case 'apply-edit':
      applyEdit();
      break;
    case 'cancel-edit':
      cancelEdit();
      break;
  }
});

render();
