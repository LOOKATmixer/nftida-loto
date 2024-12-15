$(document).ready(function() {

    $(".j-button-search").mousedown(function(){
        $(this).addClass("pressed");
    });

    $(".j-button-search").mouseup(function(){
        $(this).removeClass("pressed");
    });

    $(".j-button-search").on("tap",function(){
        $(this).removeClass("pressed");
    });

    $(".j-button-search").mouseout(function(){
        $(this).removeClass("pressed");
    });
    
    let ticketCount = localStorage.getItem('ticketCount') ? parseInt(localStorage.getItem('ticketCount')) : 0;
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || []; // Загружаем историю из localStorage

    // Загрузка билетов из localStorage при загрузке страницы
    if (ticketCount > 0) {
        for (let i = 1; i <= ticketCount; i++) {
            const ticketData = localStorage.getItem(`ticket-${i}`);
            if (ticketData) {
                appendTicket(ticketData, i);
            }
        }
    }

    $('#add-ticket-btn').on('click', function() {
        ticketCount++;
        localStorage.setItem('ticketCount', ticketCount); // Сохраняем количество билетов

        appendTicket(null, ticketCount);
        updateDeleteAllButtonVisibility();

        // Переводим билет в режим редактирования сразу после добавления
        setTimeout(function() {
            $(`#ticket-${ticketCount} .edit-icon`).click(); // Имитация клика на кнопку "Редактировать"
        }, 0); // Даем возможность элементу отрисоваться перед кликом
    });

    // Функция для добавления билета
    function appendTicket(ticketData = null, ticketId) {
        let ticketHTML = `
            <div class="ticket" id="ticket-${ticketId}">
                <h3>Билет № ${ticketId}
                    <span class="edit-icon fa-regular fa-pen-to-square" data-id="${ticketId}"></span>
                    <span class="save-icon fa-regular fa-floppy-disk" data-id="${ticketId}" style="display: none;"></span>
                    <span class="delete-icon fa-regular fa-trash" data-id="${ticketId}" style="color: #AE2F27; cursor: pointer; display: none;"></span>
                </h3>
                <div class="ticket-area">
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(0, 9) : [])}
                    </div>
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(9, 18) : [])}
                    </div>
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(18, 27) : [])}
                    </div>
                </div>
                <div class="ticket-area">
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(27, 36) : [])}
                    </div>
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(36, 45) : [])}
                    </div>
                    <div class="ticket-row">
                        ${createRow(ticketData ? ticketData.split(',').slice(45, 54) : [])}
                    </div>
                </div>
            </div>
        `;

        $('#tickets-container').append(ticketHTML);
        saveTicketData(ticketId); // Сохраняем данные билета в localStorage
    }

    function createRow(values) {
        let rowHTML = '';
        for (let i = 0; i < 9; i++) {
            const value = values[i] ? values[i] : ''; // Заполняем значениями из localStorage или оставляем пустым
            rowHTML += `<input type="number" class="ticket-cell" min="1" max="90" value="${value}" disabled />`; // Делаем инпуты неактивными
        }
        return rowHTML;
    }

    function saveTicketData(ticketId) {
        const ticketValues = [];
        $(`#ticket-${ticketId} .ticket-cell`).each(function() {
            ticketValues.push($(this).val()); // Получаем значения из всех ячеек
        });
        localStorage.setItem(`ticket-${ticketId}`, ticketValues.join(',')); // Сохраняем в localStorage
    }

    // Обработчик поиска числа
    $('#search-input').on('keydown', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault(); // Предотвращаем стандартное поведение Enter (например, отправку формы)
            $('#search-btn').trigger('click'); // Эмулируем клик по кнопке
        }
    });
    $('#search-btn').on('click', function() {
        const searchValue = $('#search-input').val().trim();
        const numValue = parseInt(searchValue);

        if (numValue < 1 || numValue > 90 || isNaN(numValue)) {
            alert('Введите число от 1 до 90.');
            return;
        }

        let foundMatch = false; // Флаг для проверки совпадений

        // Проверяем, есть ли число в билетах и обводим инпуты
        $('.ticket-cell').each(function() {
            const cellValue = $(this).val();
            const currentBorderColor = $(this).css('border-color');

            // Проверяем, совпадает ли значение, и обводим зеленым, если еще не обведено
            if (cellValue == numValue && currentBorderColor !== 'green') {
                foundMatch = true;
                $(this).css('border', '2px solid green'); // Обводим зеленым
                launchConfettiForCell(this);
                // Запуск конфетти для совпавшей ячейки
            }
        });

        // Обновляем историю поиска с состоянием
        const existingEntry = searchHistory.find(item => item.num === numValue);
        if (!existingEntry) {
            searchHistory.push({ num: numValue, matched: foundMatch });
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }

        // // Запоминаем число в истории поиска
        // if (!searchHistory.includes(numValue)) {
        //     searchHistory.push(numValue);
        //     localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        // }

        // Обновление результатов поиска
        updateSearchResults();

        // Очищаем поле поиска
        $('#search-input').val('');
    });

    // Обновление результатов поиска
    function updateSearchResults() {
        $('#search-results').empty(); // Очищаем предыдущие результаты
        if (searchHistory.length > 0) {
            $('#search-results').append('<h4 style="text-align: left;">Выпавшие бочонки:</h4>');
            searchHistory.forEach(function(entry) {
                const сolor = entry.matched ? 'green' : '#AE2F27';
                const border = entry.matched ? '2px solid green' : '2px solid #AE2F27';
                $('#search-results').append(`
                <div class="search-item" style="color: ${сolor}; border: ${border};">
                    <span>${entry.num}</span>
                    <div class="remove-search-item fa-regular fa-trash fa-lg" data-num="${entry.num}" style="cursor: pointer; color: #AE2F27;"></div>
                </div>
            `);
            });
        }
    }

    // Удаление числа из истории поиска при нажатии на крестик
    $(document).on('click', '.remove-search-item', function() {
        const numToRemove = parseInt($(this).data('num'));

        // Удаляем число из истории поиска
        searchHistory = searchHistory.filter(entry => entry.num !== numToRemove);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory)); // Обновляем localStorage

        // Обновляем результаты поиска
        updateSearchResults();

        // Убираем зеленую обводку с ячеек билетов, которые соответствуют удаленному числу
        $('.ticket-cell').each(function() {
            const cellValue = parseInt($(this).val());
            if (cellValue === numToRemove) {
                $(this).css('border', ''); // Убираем обводку
            }
        });
    });

    // Редактирование билета
    $(document).on('click', '.edit-icon', function() {
        const ticketId = $(this).data('id');
        $(`#ticket-${ticketId} .ticket-cell`).prop('disabled', false); // Активируем инпуты
        $(this).hide(); // Скрываем иконку редактирования
        $(`#ticket-${ticketId} .save-icon`).show(); // Показываем иконку сохранения
        $(`#ticket-${ticketId} .delete-icon`).show(); // Показываем иконку удаления
    });

    // Сохранение билета
    $(document).on('click', '.save-icon', function() {
        const ticketId = $(this).data('id');
        $(`#ticket-${ticketId} .ticket-cell`).prop('disabled', true); // Делаем инпуты неактивными
        $(this).hide(); // Скрываем иконку сохранения
        $(`#ticket-${ticketId} .edit-icon`).show(); // Показываем иконку редактирования
        $(`#ticket-${ticketId} .delete-icon`).hide(); // Скрываем иконку удаления
        saveTicketData(ticketId); // Сохраняем данные в localStorage
    });

    // Открытие модального окна подтверждения удаления
    $(document).on('click', '.delete-icon', function() {
        const ticketId = $(this).data('id');
        $('#confirm-delete-modal').data('ticket-id', ticketId).show(); // Сохраняем ID билета в модальном окне
    });

    // Подтверждение удаления
    $('#confirm-delete-yes').on('click', function() {
        const ticketId = $('#confirm-delete-modal').data('ticket-id');
        $(`#ticket-${ticketId}`).remove(); // Удаляем билет из DOM
        localStorage.removeItem(`ticket-${ticketId}`); // Удаляем билет из localStorage
        updateTicketCount(); // Обновляем количество билетов в localStorage
        updateDeleteAllButtonVisibility();

        // Очищаем localStorage, если билетов больше нет
        if (ticketCount <= 0) {
            localStorage.clear(); // Очищаем localStorage
        }

        $('#confirm-delete-modal').hide(); // Скрываем модальное окно
    });

    // Отмена удаления
    $('#confirm-delete-no').on('click', function() {
        $('#confirm-delete-modal').hide(); // Скрываем модальное окно
    });

    // Удаление всех билетов
    $('#delete-all-tickets-btn').on('click', function() {
        $('#confirm-delete-all-modal').show(); // Открываем модальное окно для удаления всех билетов
    });

    // Подтверждение удаления всех билетов
    $('#confirm-delete-all-yes').on('click', function() {
        $('#tickets-container').empty(); // Очищаем контейнер с билетами
        localStorage.clear(); // Очищаем localStorage
        ticketCount = 0; // Обнуляем счетчик билетов

        // Очищаем историю поиска и найденные числа
        searchHistory = [];
        foundNumbers = [];

        // Очищаем интерфейс результатов поиска
        $('#search-results').empty();

        // Скрываем кнопку удаления всех билетов
        updateDeleteAllButtonVisibility();

        // Закрываем модальное окно
        $('#confirm-delete-all-modal').hide();
    });

    // Отмена удаления всех билетов
    $('#confirm-delete-all-no').on('click', function() {
        $('#confirm-delete-all-modal').hide(); // Скрываем модальное окно
    });

    function updateTicketCount() {
        ticketCount--; // Уменьшаем счетчик билетов
        localStorage.setItem('ticketCount', ticketCount); // Сохраняем новое количество
    }

    // Загрузка истории поиска из localStorage
    function loadSearchHistory() {
        const savedSearchHistory = localStorage.getItem('searchHistory');

        if (savedSearchHistory) {
            searchHistory = JSON.parse(savedSearchHistory);
            updateSearchResults(); // Выводим историю поиска

            // Обводим числа в билетах, если они есть в истории поиска
            $('.ticket-cell').each(function() {
                const cellValue = parseInt($(this).val());

                // Проверяем, есть ли значение ячейки в истории поиска
                if (searchHistory.includes(cellValue)) {
                    $(this).css('border', '2px solid green'); // Обводим зеленым, если совпадает
                }
            });
        }
    }

    function updateDeleteAllButtonVisibility() {
        if (ticketCount > 0) {
            $('#delete-all-tickets-btn').show(); // Показываем кнопку
        } else {
            $('#delete-all-tickets-btn').hide(); // Скрываем кнопку
        }
    }

    function launchConfettiForCell(cellElement) {
        var cellOffset = $(cellElement).offset(); // Получаем координаты ячейки

        var count = 200;
        var defaults = {
            origin: {
                x: cellOffset.left / window.innerWidth,
                y: cellOffset.top / window.innerHeight
            }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            }));
        }

        fire(0.25, {
            particleCount: 200,
            spread: 60,
            origin: {
                x: cellOffset.left / window.innerWidth,
                y: (cellOffset.top - 20) / window.innerHeight // Конфетти над ячейкой
            },
            angle: 90
        });
    }

    // Вызов функции для загрузки истории поиска при загрузке страницы
    loadSearchHistory();
    updateDeleteAllButtonVisibility();
});