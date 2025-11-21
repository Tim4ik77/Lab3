/// Объект для хранения состояния графика
const chartState = {
    xSel: null,
    baseScale: 70, // базовый масштаб для R = 2
    width: 800,
    height: 800,
    centerX: 0,
    centerY: 0,
    form: null,
    xButtons: null,
    yInput: null,
    rSelect: null
};

// Инициализация графика
function initChart(historyData) {
    console.log('Инициализация графика с данными:', historyData);

    // Получаем элементы DOM
    chartState.xButtons = document.querySelectorAll('.x-btn');
    chartState.yInput = document.getElementById('y');
    chartState.rSelect = document.getElementById('r');

    // Находим форму (может иметь составной ID в JSF)
    chartState.form = document.getElementById('jsfForm');
    if (!chartState.form) {
        // Поиск по частичному совпадению ID
        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            if (form.id && form.id.includes('jsfForm')) {
                chartState.form = form;
                break;
            }
        }
    }

    // Обработчики для кнопок X
    if (chartState.xButtons) {
        chartState.xButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                chartState.xButtons.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                chartState.xSel = parseFloat(this.getAttribute('data-val'));

                // Обновляем скрытое поле для JSF
                const hiddenInput = document.querySelector('[id$=":xHidden"]');
                if (hiddenInput) {
                    hiddenInput.value = chartState.xSel;
                }
            });
        });
    }

    // Инициализация размеров и центра графика
    chartState.centerX = chartState.width / 2;
    chartState.centerY = chartState.height / 2;

    // Создание графика
    createChart(historyData);

    // Обработчик изменения R (для перерисовки графика)
    if (chartState.rSelect) {
        chartState.rSelect.addEventListener('change', function() {
            createChart(historyData);
        });
    }
}

// Проверка валидности формы
function validateForm() {
    console.log('Проверка валидности формы');

    const y = chartState.yInput ? chartState.yInput.value.trim() : '';
    const r = chartState.rSelect ? chartState.rSelect.value : '';

    // Валидация Y
    const decimalRegex = /^-?\d+(\.\d{1,4})?$/;
    if (!decimalRegex.test(y)) {
        alert('Y должен быть числом с максимум 4 знаками после запятой');
        return false;
    }

    const yValue = parseFloat(y);
    if (yValue < -3 || yValue > 3 || isNaN(yValue)) {
        alert('Y должен быть в диапазоне от -3 до 3');
        return false;
    }

    // Валидация X
    if (chartState.xSel === null) {
        alert('Выберите значение X');
        return false;
    }

    // Валидация R
    if (!r || r === '0') {
        alert('Выберите значение R');
        return false;
    }

    // Обновляем скрытое поле перед отправкой
    const hiddenInput = document.querySelector('[id$=":xHidden"]');
    if (hiddenInput) {
        hiddenInput.value = chartState.xSel;
    }

    return true;
}

// Создание SVG-графика
function createChart(historyData) {
    const container = document.getElementById('svgContainer');
    if (!container) return;

    container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', chartState.width);
    svg.setAttribute('height', chartState.height);
    svg.setAttribute('id', 'chart');
    container.appendChild(svg);

    // Добавляем обработчик клика по SVG
    svg.addEventListener('click', function(e) {
        const rStr = chartState.rSelect ? chartState.rSelect.value : '';
        if (!rStr || rStr === '0') {
            alert('Сначала выберите R');
            return;
        }

        const r = parseFloat(rStr);
        const rect = svg.getBoundingClientRect();
        const svgX = e.clientX - rect.left;
        const svgY = e.clientY - rect.top;

        // Получаем координаты в системе графика (где R=2)
        const x_graph = (svgX - chartState.centerX) / chartState.baseScale;
        const y_graph = -(svgY - chartState.centerY) / chartState.baseScale;

        // Преобразуем в реальные координаты для текущего R
        const x_real = x_graph * (r / 2);
        const y_real = y_graph * (r / 2);

        // Округляем до 4 знаков
        const xRounded = Math.round(x_real * 10000) / 10000;
        const yRounded = Math.round(y_real * 10000) / 10000;

        // Обновляем интерфейс
        chartState.xSel = xRounded;
        chartState.xButtons.forEach(b => b.classList.remove('selected'));

        // Обновляем значение Y в поле ввода
        if (chartState.yInput) {
            chartState.yInput.value = yRounded;
        }

        // Обновляем скрытое поле X
        const hiddenInput = document.querySelector('[id$="xHidden"]');
        if (hiddenInput) {
            hiddenInput.value = xRounded;
        }

        // Отправляем форму
        if (chartState.form) {
            chartState.form.requestSubmit();
        }
    });

    drawBaseChart(svg);
    drawHistoryPoints(svg, historyData);
}

// Отрисовка базовых элементов графика (оси, фигуры области)
function drawBaseChart(svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '5');
    marker.setAttribute('refY', '5');
    marker.setAttribute('orient', 'auto-start-reverse');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', 'black');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const margin = 20;

    // Оси координат
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', margin);
    xAxis.setAttribute('y1', chartState.centerY);
    xAxis.setAttribute('x2', chartState.width - margin);
    xAxis.setAttribute('y2', chartState.centerY);
    xAxis.setAttribute('stroke', 'black');
    xAxis.setAttribute('stroke-width', '2');
    xAxis.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', chartState.centerX);
    yAxis.setAttribute('y1', chartState.height - margin);
    yAxis.setAttribute('x2', chartState.centerX);
    yAxis.setAttribute('y2', margin);
    yAxis.setAttribute('stroke', 'black');
    yAxis.setAttribute('stroke-width', '2');
    yAxis.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(yAxis);

    // Метки осей
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', chartState.width - 20);
    xLabel.setAttribute('y', chartState.centerY - 10);
    xLabel.setAttribute('font-size', '16');
    xLabel.setAttribute('fill', 'black');
    xLabel.textContent = 'X';
    svg.appendChild(xLabel);

    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', chartState.centerX + 10);
    yLabel.setAttribute('y', 20);
    yLabel.setAttribute('font-size', '16');
    yLabel.setAttribute('fill', 'black');
    yLabel.textContent = 'Y';
    svg.appendChild(yLabel);

    // Фигуры области (для R=2)
    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectangle.setAttribute('x', chartState.centerX - 2 * chartState.baseScale);
    rectangle.setAttribute('y', chartState.centerY - 1 * chartState.baseScale);
    rectangle.setAttribute('width', 2 * chartState.baseScale);
    rectangle.setAttribute('height', 1 * chartState.baseScale);
    rectangle.setAttribute('fill', 'blue');
    rectangle.setAttribute('opacity', '0.3');
    svg.appendChild(rectangle);

    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    triangle.setAttribute('points',
        `${chartState.centerX},${chartState.centerY} ` +
        `${chartState.centerX + 2 * chartState.baseScale},${chartState.centerY} ` +
        `${chartState.centerX},${chartState.centerY + 1 * chartState.baseScale}`
    );
    triangle.setAttribute('fill', 'blue');
    triangle.setAttribute('opacity', '0.3');
    svg.appendChild(triangle);

    const sectorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sectorPath.setAttribute('d',
        `M ${chartState.centerX} ${chartState.centerY} ` +
        `L ${chartState.centerX - 2 * chartState.baseScale} ${chartState.centerY} ` +
        `A ${2 * chartState.baseScale} ${2 * chartState.baseScale} 0 0 0 ` +
        `${chartState.centerX} ${chartState.centerY + 2 * chartState.baseScale} ` +
        `Z`
    );
    sectorPath.setAttribute('fill', 'blue');
    sectorPath.setAttribute('opacity', '0.3');
    svg.appendChild(sectorPath);

    // Метки на осях
    const ticks = [-2, -1, 1, 2];
    ticks.forEach(val => {
        // Метки для оси X
        const xTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xTick.setAttribute('x1', chartState.centerX + val * chartState.baseScale);
        xTick.setAttribute('y1', chartState.centerY - 4);
        xTick.setAttribute('x2', chartState.centerX + val * chartState.baseScale);
        xTick.setAttribute('y2', chartState.centerY + 4);
        xTick.setAttribute('stroke', 'black');
        svg.appendChild(xTick);

        const xText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xText.setAttribute('x', chartState.centerX + val * chartState.baseScale);
        xText.setAttribute('y', chartState.centerY - 10);
        xText.setAttribute('font-size', '14');
        xText.setAttribute('text-anchor', 'middle');
        xText.textContent = val === 1 ? 'R/2' : val === -1 ? '-R/2' : (val > 0 ? 'R' : '-R');
        svg.appendChild(xText);

        // Метки для оси Y
        const yTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yTick.setAttribute('x1', chartState.centerX - 4);
        yTick.setAttribute('y1', chartState.centerY - val * chartState.baseScale);
        yTick.setAttribute('x2', chartState.centerX + 4);
        yTick.setAttribute('y2', chartState.centerY - val * chartState.baseScale);
        yTick.setAttribute('stroke', 'black');
        svg.appendChild(yTick);

        const yText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yText.setAttribute('x', chartState.centerX + 8);
        yText.setAttribute('y', chartState.centerY - val * chartState.baseScale + 4);
        yText.setAttribute('font-size', '14');
        yText.setAttribute('text-anchor', 'start');
        yText.textContent = val === 1 ? 'R/2' : val === -1 ? '-R/2' : (val > 0 ? 'R' : '-R');
        svg.appendChild(yText);
    });
}

// Отрисовка исторических точек на графике
function drawHistoryPoints(svg, history) {
    if (!history || !Array.isArray(history)) {
        console.log('Нет данных истории для отрисовки');
        return;
    }

    const pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pointsGroup.setAttribute('id', 'points');
    svg.appendChild(pointsGroup);

    history.forEach(entry => {
        try {
            // переводим реальные координаты в "график с R=2"
            const x_graph = entry.x * (2 / entry.r);
            const y_graph = entry.y * (2 / entry.r);

            const cx = chartState.centerX + x_graph * chartState.baseScale;
            const cy = chartState.centerY - y_graph * chartState.baseScale; // ось Y вниз

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', 5);
            circle.setAttribute('fill', entry.hit ? 'green' : 'red');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '0.5');
            pointsGroup.appendChild(circle);
        } catch (e) {
            console.error('Ошибка при отрисовке точки:', e);
        }
    });
}