document.addEventListener("DOMContentLoaded", () => {
    const leftSidebar = document.getElementById('left-sidebar');
    const centerCanvas = document.getElementById('center-canvas');
    const rightSidebar = document.getElementById('right-sidebar');

    let selectedElement = null; // Track the currently selected element

    const blocks = [
        { name: 'Block 1', html: 'blocks/block1.html', image: 'assets/block1.png' },
        { name: 'Block 2', html: 'blocks/block2.html', image: 'assets/block2.png' },
        { name: 'Block 3', html: 'blocks/block3.html', image: 'assets/block3.png' },
        { name: 'Block 4', html: 'blocks/block4.html', image: 'assets/block4.png' },
    ];

    // Add hover effect for elements
    centerCanvas.addEventListener('mouseover', function (event) {
        const hoveredElement = event.target;
        if (hoveredElement.classList.contains('canvas-block') || hoveredElement === centerCanvas) return;
        hoveredElement.style.outline = '2px dashed blue';
    });

    centerCanvas.addEventListener('mouseout', function (event) {
        const hoveredElement = event.target;
        if (hoveredElement.classList.contains('canvas-block') || hoveredElement === centerCanvas) return;
        hoveredElement.style.outline = '';
    });

    // Load block items in the left sidebar
    blocks.forEach((block, index) => {
        const blockItem = document.createElement('div');
        blockItem.className = 'block-item';
        blockItem.innerHTML = `<img src="${block.image}" alt="${block.name}">`;
        blockItem.addEventListener('click', () => loadBlock(index));
        leftSidebar.appendChild(blockItem);
    });

    // Function to load block into the center canvas
    function loadBlock(index) {
        fetch(blocks[index].html)
            .then(response => response.text())
            .then(html => {
                const blockElement = document.createElement('div');
                blockElement.className = 'canvas-block';
                blockElement.innerHTML = html;
                blockElement.dataset.blockIndex = index;
                centerCanvas.appendChild(blockElement);

                // Add event listeners to each element within the block for inline editing
                // blockElement.querySelectorAll('*').forEach(elem => {
                //     elem.addEventListener('click', (e) => {
                //         e.stopPropagation(); // Prevent other events
                //         loadSettings(elem);  // Load settings for the clicked element
                //         selectElement(elem); // Add hover border
                //     });
                // });
            });
    }

    centerCanvas.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent other events
        if (e.target !== centerCanvas) {
            selectElement(e.target); // Load settings for clicked element
        } else {
            selectElement(null); // Hide settings if no element is clicked
        }
    });

    // Generalized function to create and append settings form
    function createSettingField(type, label, value, onChange, defaultValue, tab = 'basic') {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.className = 'form-group'; // Use Bootstrap's form group class

        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = label;
        fieldLabel.className = 'form-label'; // Bootstrap label class
        fieldWrapper.appendChild(fieldLabel);

        let inputField;

        switch (type) {
            case 'select':
                inputField = document.createElement('select');
                inputField.className = 'form-control'; // Bootstrap select class
                value.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    if (option.value === defaultValue) opt.selected = true;
                    inputField.appendChild(opt);
                });
                break;
            case 'color':
                inputField = document.createElement('input');
                inputField.type = 'color';
                inputField.className = 'form-control'; // Bootstrap color input class
                inputField.value = value || '#ffffff';
                break;
            case 'file':
                inputField = document.createElement('input');
                inputField.type = 'file';
                inputField.className = 'form-control-file'; // Bootstrap file input class
                inputField.addEventListener('change', (e) => handleFileUpload(e, element));
                break;
            default:
                inputField = document.createElement('input');
                inputField.type = type;
                inputField.className = 'form-control'; // Bootstrap text input class
                inputField.value = value || '';
                break;
        }

        inputField.addEventListener('input', onChange);

        fieldWrapper.appendChild(inputField);

        // Append the field to the selected tab's content area
        document.getElementById(tab).appendChild(fieldWrapper);
    }



    // Function to load settings form in the right sidebar based on the element type
    function loadSettings(element) {
        // Show the right sidebar
        rightSidebar.style.display = 'block';

        // Clear previous settings form in both tabs
        document.getElementById('basic').innerHTML = '';
        document.getElementById('advanced').innerHTML = '';

        const styles = window.getComputedStyle(element);
        const tagName = element.tagName.toLowerCase();

        const elementSettings = {
            text: ['h1', 'p', 'h2'],
            img: ['img']
        };

        // text 
        if (elementSettings.text.includes(tagName)) {
            createSettingField('text', 'Text Content', element.innerText, (e) => {
                element.innerText = e.target.value;
            }, undefined, 'basic');
            createSettingField('number', 'Font Size', parseInt(styles.fontSize), (e) => {
                element.style.fontSize = `${e.target.value}px`;
            }, undefined, 'basic');
            createSettingField('color', 'Text Color', rgbToHex(styles.color), (e) => {
                element.style.color = e.target.value;
            }, undefined, 'basic');
        }

        // img
        if (elementSettings.img.includes(tagName)) {
            createSettingField('text', 'Image Source', element.src, (e) => {
                element.src = e.target.value;
            }, undefined, 'basic');
            createSettingField('number', 'Width', element.width, (e) => {
                element.style.width = `${e.target.value}px`;
            }, undefined, 'basic');
            createSettingField('number', 'Height', element.height, (e) => {
                element.style.height = `${e.target.value}px`;
            }, undefined, 'basic');
        }

        // Shared settings for all elements (like margin and padding)
        createBorderSettings(element, styles);

        createPaddingMarginSettings(element, styles);
    }

    // Function to create padding and margin settings
    function createPaddingMarginSettings(element, styles) {

        createSettingField('color', 'Background Color', rgbToHex(styles.backgroundColor), (e) => {
            element.style.backgroundColor = e.target.value;
        }, 'basic');

        // Padding settings
        ['Top', 'Right', 'Bottom', 'Left'].forEach(position => {
            createSettingField('number', `Padding ${position}`, parseInt(styles[`padding${position}`]), (e) => {
                element.style[`padding${position}`] = `${e.target.value}px`;
            }, undefined, 'advanced');
        });

        // Margin settings
        ['Top', 'Right', 'Bottom', 'Left'].forEach(position => {
            createSettingField('number', `Margin ${position}`, parseInt(styles[`margin${position}`]), (e) => {
                element.style[`margin${position}`] = `${e.target.value}px`;
            }, undefined, 'advanced');
        });
    }

    function createBorderSettings(element, styles) {
        // border width
        createSettingField('number', 'Border Width', parseInt(styles.borderWidth), (e) => {
            element.style.borderWidth = `${e.target.value}px`;
        }, undefined, 'advanced');

        // border style
        createSettingField('select', 'Border Style', ['none', 'solid', 'dashed', 'dotted'].map(style => ({ value: style, label: style })), (e) => {
            element.style.borderStyle = e.target.value;
        }, styles.borderStyle, 'advanced');

        // border color
        createSettingField('color', 'Border Color', rgbToHex(styles.borderColor), (e) => {
            element.style.borderColor = e.target.value;
        }, undefined, 'advanced');
    }

    // Helper function to convert rgb color to hex
    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        return `#${((1 << 24) + (+result[0] << 16) + (+result[1] << 8) + +result[2]).toString(16).slice(1)}`;
    }

    // Function to handle file upload
    function handleFileUpload(event, element) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                element.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Function to select and highlight the element
    function selectElement(element) {
        // Remove the 'selected' class from the previously selected element
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }

        if (element) {
            element.classList.add('selected');
            selectedElement = element;
            loadSettings(element); // Load settings for the selected element
            rightSidebar.style.display = 'block'; // Show the sidebar when an element is selected
        } else {
            selectedElement = null;
            rightSidebar.style.display = 'none'; // Hide the sidebar when no element is selected
        }
    }
});
