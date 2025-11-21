// Настройки графика
const WIDTH = 400;
const HEIGHT = 400;
const MARGIN = 100; // Отступ для подписей и стрелок
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const SCALE = 40; // Пикселей на единицу координат

// Ссылка на DOM элементы
const chartContainer = document.getElementById('chart-container');

function drawGraph() {
    if (!chartContainer) return;
    chartContainer.innerHTML = ''; // Очистка перед перерисовкой

    // 1. Получаем текущий R прямо из формы
    // Ищем выбранный input типа radio.
    // Если ничего не выбрано (страница только загрузилась), берем 1.
    let rVal = 1;
    const selectedRadio = document.querySelector('input[type="radio"]:checked');
    if (selectedRadio) {
        rVal = parseFloat(selectedRadio.value);
    } else if (typeof currentR !== 'undefined') {
        rVal = currentR; // Фолбэк на переменную из JSF
    }

    // Создаем SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', WIDTH);
    svg.setAttribute('height', HEIGHT);
    svg.setAttribute('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    svg.style.border = '1px solid #ddd';
    svg.style.background = 'white';
    svg.addEventListener('click', (e) => handleGraphClick(e, rVal));
    chartContainer.appendChild(svg);

    // 2. Определяем стрелку (Marker)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '10'); // Острие стрелки
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', 'black');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    // 3. Рисуем фигуры (Вариант: Прямоугольник II четв, Сектор III четв, Треугольник IV четв)
    drawShapes(svg, rVal);

    // 4. Рисуем Оси
    drawAxes(svg);

    // 5. Рисуем риски (ticks) и подписи
    drawTicks(svg, rVal);

    // 6. Рисуем точки из истории
    if (typeof pointsHistory !== 'undefined') {
        pointsHistory.forEach(pt => {
            drawPoint(svg, pt.x, pt.y, rVal);
        });
    }
}

function drawShapes(svg, r) {
    // Цвет фигур
    const shapeColor = '#007bff';
    const shapeOpacity = '0.5';

    // II Четверть: Прямоугольник (-R/2 <= x <= 0, 0 <= y <= R)
    // SVG: x от (CENTER_X - R/2*SCALE) до CENTER_X
    // SVG: y от (CENTER_Y - R*SCALE) до CENTER_Y
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', CENTER_X - (r / 2) * SCALE);
    rect.setAttribute('y', CENTER_Y - r * SCALE);
    rect.setAttribute('width', (r / 2) * SCALE);
    rect.setAttribute('height', r * SCALE);
    rect.setAttribute('fill', shapeColor);
    rect.setAttribute('fill-opacity', shapeOpacity);
    svg.appendChild(rect);

    // III Четверть: Сектор (R/2)
    // SVG Path: Move Center -> Line (-R/2, 0) -> Arc -> Line (0, -R/2) -> Close
    const sector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    sector.setAttribute('d',
        `M ${CENTER_X} ${CENTER_Y} ` +
        `L ${CENTER_X - (r / 2) * SCALE} ${CENTER_Y} ` +
        `A ${(r / 2) * SCALE} ${(r / 2) * SCALE} 0 0 0 ${CENTER_X} ${CENTER_Y + (r / 2) * SCALE} ` +
        `Z`
    );
    sector.setAttribute('fill', shapeColor);
    sector.setAttribute('fill-opacity', shapeOpacity);
    svg.appendChild(sector);

    // IV Четверть: Треугольник ((0,0), (R/2, 0), (0, -R/2))
    // SVG: (CENTER_X, CENTER_Y), (CENTER_X + R/2, CENTER_Y), (CENTER_X, CENTER_Y + R/2)
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    triangle.setAttribute('points',
        `${CENTER_X},${CENTER_Y} ` +
        `${CENTER_X + (r / 2) * SCALE},${CENTER_Y} ` +
        `${CENTER_X},${CENTER_Y + (r / 2) * SCALE}`
    );
    triangle.setAttribute('fill', shapeColor);
    triangle.setAttribute('fill-opacity', shapeOpacity);
    svg.appendChild(triangle);
}

function drawAxes(svg) {
    // Ось X
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', MARGIN);
    xAxis.setAttribute('y1', CENTER_Y);
    xAxis.setAttribute('x2', WIDTH - MARGIN);
    xAxis.setAttribute('y2', CENTER_Y);
    xAxis.setAttribute('stroke', 'black');
    xAxis.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(xAxis);

    // Текст X
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', WIDTH - MARGIN + 10);
    xLabel.setAttribute('y', CENTER_Y + 5);
    xLabel.textContent = 'X';
    svg.appendChild(xLabel);

    // Ось Y
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', CENTER_X);
    yAxis.setAttribute('y1', HEIGHT - MARGIN);
    yAxis.setAttribute('x2', CENTER_X);
    yAxis.setAttribute('y2', MARGIN);
    yAxis.setAttribute('stroke', 'black');
    yAxis.setAttribute('marker-end', 'url(#arrow)');
    svg.appendChild(yAxis);

    // Текст Y
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('x', CENTER_X + 10);
    yLabel.setAttribute('y', MARGIN - 5);
    yLabel.textContent = 'Y';
    svg.appendChild(yLabel);
}

function drawTicks(svg, r) {
    // Значения тиков (как в задании: -R, -R/2, R/2, R)
    const tickValues = [-r, -r/2, r/2, r];
    // Если вы хотите подписи именно "R", "R/2" - используйте этот массив
    // const tickLabels = ['-R', '-R/2', 'R/2', 'R'];

    // Если нужны числовые значения (например -5, -2.5...):
    const tickLabels = tickValues.map(v => v.toString());

    tickValues.forEach((val, i) => {
        // На оси X
        const xPos = CENTER_X + val * SCALE;
        const lineX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineX.setAttribute('x1', xPos);
        lineX.setAttribute('y1', CENTER_Y - 3);
        lineX.setAttribute('x2', xPos);
        lineX.setAttribute('y2', CENTER_Y + 3);
        lineX.setAttribute('stroke', 'black');
        svg.appendChild(lineX);

        const textX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textX.setAttribute('x', xPos);
        textX.setAttribute('y', CENTER_Y + 15);
        textX.setAttribute('text-anchor', 'middle');
        textX.setAttribute('font-size', '12');
        textX.textContent = tickLabels[i];
        svg.appendChild(textX);

        // На оси Y
        const yPos = CENTER_Y - val * SCALE;
        const lineY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineY.setAttribute('x1', CENTER_X - 3);
        lineY.setAttribute('y1', yPos);
        lineY.setAttribute('x2', CENTER_X + 3);
        lineY.setAttribute('y2', yPos);
        lineY.setAttribute('stroke', 'black');
        svg.appendChild(lineY);

        const textY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textY.setAttribute('x', CENTER_X + 8);
        textY.setAttribute('y', yPos + 4);
        textY.setAttribute('font-size', '12');
        textY.textContent = tickLabels[i];
        svg.appendChild(textY);
    });
}

function drawPoint(svg, x, y, r) {
    const cx = CENTER_X + x * SCALE;
    const cy = CENTER_Y - y * SCALE;

    // Проверяем попадание на клиенте с ТЕКУЩИМ R
    const isHit = checkHit(x, y, r);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', 4);
    circle.setAttribute('fill', isHit ? '#28a745' : '#dc3545'); // Зеленый или Красный
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('stroke-width', '1');
    svg.appendChild(circle);
}

// Логика проверки (должна совпадать с Java)
function checkHit(x, y, r) {
    // 1. II Четверть: Прямоугольник
    // X in [-R/2, 0], Y in [0, R]
    if (x <= 0 && y >= 0) {
        return x >= -r/2.0 && y <= r;
    }

    // 2. III Четверть: Сектор
    // X <= 0, Y <= 0, x^2 + y^2 <= (R/2)^2
    if (x <= 0 && y <= 0) {
        return (x * x + y * y) <= (r/2.0 * r/2.0);
    }

    // 3. IV Четверть: Треугольник
    // X >= 0, Y <= 0. Прямая Y = X - R/2. Попадание если Y >= X - R/2
    if (x >= 0 && y <= 0) {
        return y >= (x - r/2.0);
    }

    return false;
}

function handleGraphClick(e, r) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const graphX = (clickX - CENTER_X) / SCALE;
    const graphY = (CENTER_Y - clickY) / SCALE;

    // Ищем скрытую форму по частичным ID (так как JSF добавляет префиксы)
    // Обычно id="hiddenForm:graphX"
    let xInput = document.querySelector("input[id$='graphX']");
    let yInput = document.querySelector("input[id$='graphY']");
    let submitBtn = document.querySelector("[id$='graphSubmit']");

    if (xInput && yInput && submitBtn) {
        xInput.value = graphX.toFixed(4);
        yInput.value = graphY.toFixed(4);
        submitBtn.click();
    } else {
        console.error("Не найдена скрытая форма JSF");
    }
}

// Запуск при загрузке
window.onload = drawGraph;