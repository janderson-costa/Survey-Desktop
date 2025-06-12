// src/utils.js
var utils = new Utils();
function Utils() {
  this.generateGuid = generateGuid;
  this.mergeProps = mergeProps;
  this.getElementIndex = getElementIndex;
  this.createRangeArray = createRangeArray;
  this.isArrayOfHTMLElement = isArrayOfHTMLElement;
  this.parseDimension = parseDimension;
  this.setElementAttr = setElementAttr;
  this.setElementStyle = setElementStyle;
  function generateGuid() {
    const guid = ("1000000-1000-4000-8000" + -1e11).replace(
      /[018]/g,
      (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    return "a" + guid;
  }
  function mergeProps(target, source) {
    const merged = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && !(source[key] instanceof Array) && !(source[key] instanceof Function) && !(source[key] instanceof HTMLElement)) {
        merged[key] = mergeProps(target[key] || {}, source[key]);
      } else {
        merged[key] = source[key];
      }
    }
    return merged;
  }
  function getElementIndex($element) {
    const children = Array.from($element.parentElement.children);
    return children.indexOf($element);
  }
  function createRangeArray(startNumber, endNumber) {
    const isAscending = startNumber <= endNumber;
    return Array.from(
      { length: Math.abs(endNumber - startNumber) + 1 },
      (_, index) => isAscending ? startNumber + index : startNumber - index
    );
  }
  function isArrayOfHTMLElement(obj) {
    if (Array.isArray(obj))
      return obj.every((item) => item instanceof HTMLElement);
    return false;
  }
  function parseDimension(value) {
    return typeof value == "number" ? `${value}px` : value || "";
  }
  function setElementStyle(elements, attributes = {}) {
    setElementAttr(elements, attributes, "style");
  }
  function setElementAttr(elements, attributes = {}, objectName = "") {
    elements = elements instanceof Array ? elements : [elements];
    elements.forEach((x) => {
      for (const key in attributes) {
        let node = objectName ? x[objectName] : x;
        let value = attributes[key];
        if (objectName == "style") {
          let important = "";
          if (!key.match(/index|line|grid|order|tab|orphans|widows|columns|counter|opacity/i))
            value = typeof value == "number" ? value + "px" : value;
          if (value.match(/important/i)) {
            value = value.substring(0, value.indexOf("!") - 1).trim();
            important = "important";
          }
          if (important)
            node.setProperty(key, value, important);
          else
            node[key] = value;
        } else {
          typeof node[key] == "undefined" ? node.setAttribute(key, value) : node[key] = value;
        }
      }
    });
  }
}

// src/constants.js
var TableOptions = class {
  data = [];
  /* [
  	{ fieldName1: value, fieldName2: value },
  	{ fieldName2: value, fieldName2: value },
  	..
  ] */
  place = null;
  // HTMLElement
  header = {
    hidden: false,
    // boolean
    disabled: false
    // boolean
  };
  columns = null;
  /* {
  	fieldName1: ColumnOptions,
  	fieldName2: ColumnOptions,
  	..
  } */
  rows = {
    selectOnClick: false,
    // boolean
    allowMultipleSelection: true
    // boolean
  };
  cells = null;
  /* {
  	fieldName1: {
  		display: ({ item, value }) => { return.. },
  		style: object,
  	},
  	fieldName2: {
  		display: ({ item, value }) => { return.. },
  		style: object,
  	}
  	..
  } */
  borders = {
    table: {
      top: false,
      // boolean
      bottom: false,
      // boolean
      all: false,
      // boolean
      radius: null
      // px
    },
    rows: true,
    // boolean
    cells: false
    // boolean
  };
  footer = {
    hidden: false,
    // boolean
    disabled: false,
    // boolean
    content: null
    // HTMLElement | string
  };
  width = null;
  // number
  height = null;
  // number
  style = null;
  // object: ex.: { color: red, 'min-width': 150 }
  checkbox = false;
  // boolean
  sort = false;
  // boolean
  resize = false;
  // boolean
  disabled = false;
  // boolean
  onAddRow = null;
  // function
  onSelectRows = null;
  // function
  onUnselectRows = null;
  // function
  onUpdateRow = null;
  // function
  onRemoveRows = null;
  // function
  onDoubleClickRow = null;
  // function
  onResizeColumn = null;
  // function
  onClickOut = null;
  // function
  onCopyClip = null;
  // function
  onScroll = null;
  // ! REMOVER EVENTO
  onScrollEnd = null;
  // function
};
var ColumnOptions = class {
  // private
  checkbox = false;
  // boolean
  // public
  name = null;
  // string
  displayName = null;
  // string
  width = null;
  // number | string
  minWidth = null;
  // number | string
  resize = false;
  // boolean
  hidden = false;
  // boolean
  disabled = false;
  // boolean
  style = null;
  // object: ex.: { color: red, 'min-width': 150 }
};
var CellOptions = class {
  // private
  row = null;
  // Row
  checkbox = false;
  // boolean
  data = null;
  // object
  value = null;
  // any
  // public
  name = null;
  // string
  hidden = false;
  // boolean
  disabled = false;
  // boolean
  display = null;
  // function
  style = null;
  // object: ex.: { color: red, 'min-width': 150 }
};

// src/components/Column.js
function Column(table, options) {
  const $cell = create();
  const _cell = {
    element: $cell,
    isHidden: options.hidden,
    isDisabled: options.disabled,
    options,
    show,
    checked,
    disable
  };
  show(!options.hidden);
  disable(options.disabled);
  return _cell;
  function create() {
    const $cell2 = document.createElement("div");
    $cell2.classList.add("dt-header-cell");
    if (options.checkbox) {
      $cell2.classList.add("checkbox");
      $cell2.insertAdjacentHTML(
        "afterbegin",
        /*html*/
        `
				<label class="dt-row-checkbox">
					<input type="checkbox" />
				</label>
			`
      );
      const $checkbox = $cell2.querySelector("label");
      $checkbox.addEventListener("change", (event) => {
        event.target.checked ? table.selectRows() : table.unselectRows(event);
      });
    } else {
      $cell2.dataset.name = options.name;
      $cell2.insertAdjacentHTML(
        "afterbegin",
        /*html*/
        `
				<label class="name" title="${options.title || ""}">${options.displayName}</label>
				<span class="controls">
					<i class="sort asc" title="Sort"></i>
					<div class="resizer"></div>
				</span>
			`
      );
      const $iconSort = $cell2.querySelector(".sort");
      if (table.options.sort && options.sort != false) {
        $cell2.classList.add("sortable");
        $cell2.addEventListener("click", () => {
          if (table.header.isDisabled || _cell.isDisabled)
            return;
          table.header.cells.forEach(
            (cell) => cell.element.classList.remove("sorted")
          );
          let ascendent = !($iconSort.getAttribute("ascendent") == "true");
          $cell2.classList.add("sorted");
          $iconSort.classList.toggle("asc", ascendent);
          $iconSort.classList.toggle("desc", !ascendent);
          $iconSort.setAttribute("ascendent", ascendent);
          table.sort(options.name, ascendent);
        });
      }
      if (table.options.resize || options.resize)
        $cell2.classList.add("resizable");
      if (options.style)
        utils.setElementStyle($cell2, options.style);
    }
    if (table.options.borders.cells)
      $cell2.classList.add("cell-border-right");
    return $cell2;
  }
  function checked(checked2 = true) {
    const $checkbox = $cell.querySelector(".dt-row-checkbox input");
    if ($checkbox)
      $checkbox.checked = checked2;
  }
  function show(show2 = true) {
    _cell.isHidden = !show2;
    options.hidden = _cell.isHidden;
    $cell.classList.toggle("visible", show2);
    $cell.classList.toggle("hidden", !show2);
    table._setBorders();
  }
  function disable(disabled = true) {
    _cell.isDisabled = disabled;
    $cell.dataset.disabled = disabled;
    Array.from($cell.children).forEach(
      ($child) => $child.classList.toggle("disabled", disabled)
    );
  }
}

// src/components/Header.js
function Header(table) {
  const _header = {
    element: null,
    cells: [],
    isHidden: false,
    isDisabled: false,
    cell,
    show,
    disable
  };
  const $header = create();
  return _header;
  function create() {
    const $header2 = document.createElement("div");
    $header2.classList.add("dt-header");
    if (table.options.checkbox) {
      const options = new ColumnOptions();
      options.checkbox = true;
      options.resize = false;
      const cell2 = Column(table, options);
      _header.cells.push(cell2);
      $header2.appendChild(cell2.element);
    }
    for (const name in table.options.columns) {
      const column = table.options.columns[name];
      const options = utils.mergeProps(new ColumnOptions(), column);
      options.name = name;
      const cell2 = Column(table, options);
      _header.cells.push(cell2);
      $header2.appendChild(cell2.element);
    }
    _header.element = $header2;
    return $header2;
  }
  function cell(nameOrIndex) {
    const cell2 = typeof nameOrIndex == "number" ? _header.cells[nameOrIndex] : _header.cells.find((cell3) => cell3.options.name == nameOrIndex);
    return cell2;
  }
  function show(show2 = true) {
    _header.isHidden = !show2;
    $header.classList.toggle("hidden", !show2);
  }
  function disable(disabled = true) {
    _header.isDisabled = disabled;
    Array.from($header.children).forEach(($child) => {
      $child.classList.toggle("disabled", disabled);
    });
  }
}

// src/components/Cell.js
function Cell(table, options) {
  const $cell = create();
  const _cell = {
    element: $cell,
    isHidden: options.hidden,
    isDisabled: options.disabled,
    options,
    value,
    display,
    checked,
    show,
    showContent,
    disable
  };
  show(!options.hidden);
  showContent(!options.hidden);
  display(value());
  return _cell;
  function create() {
    const $cell2 = document.createElement("div");
    $cell2.classList.add("dt-body-row-cell");
    if (options.checkbox) {
      $cell2.classList.add("checkbox");
      $cell2.insertAdjacentHTML(
        "afterbegin",
        /*html*/
        `
				<label class="dt-row-checkbox">
					<input type="checkbox"/>
				</label>
			`
      );
      const $checkbox = $cell2.querySelector("label");
      $checkbox.addEventListener("click", (event) => event.stopPropagation());
      $checkbox.addEventListener("change", (event) => {
        table.header.cells[0].checked(false);
        options.row.select(event.target.checked, event);
      });
    } else {
      const value2 = options.value != void 0 ? options.value : "";
      const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
      $cell2.dataset.name = options.name;
      $cell2.insertAdjacentHTML(
        "afterbegin",
        /*html*/
        `
				<div class="value-hidden">${value2}</div>
				<div class="value-display">${value2}</div>
			`
      );
      if (cell.style)
        utils.setElementStyle($cell2, cell.style);
    }
    if (table.options.borders.cells)
      $cell2.classList.add("cell-border-right");
    if (table.options.borders.rows)
      $cell2.classList.add("cell-border-bottom");
    return $cell2;
  }
  function value(value2, _display = true) {
    const $value = $cell.querySelector(".value-hidden");
    if (!$value)
      return;
    if (value2 != void 0) {
      options.data[options.name] = value2;
      $value.textContent = value2;
      if (_display)
        display(value2);
    } else {
      value2 = options.value != void 0 ? options.value : $value.textContent;
      return value2;
    }
  }
  function display(value2) {
    const $display = $cell.querySelector(".value-display");
    const cell = table.options.cells ? table.options.cells[options.name] || {} : {};
    if (cell.display) {
      const result = cell.display({
        row: options.row,
        item: options.data,
        value: value2
      });
      $display.innerHTML = "";
      if (result instanceof HTMLElement) {
        $display.appendChild(result);
      } else if (utils.isArrayOfHTMLElement(result)) {
        result.forEach((x) => $display.appendChild(x));
      } else {
        $display.innerHTML = result;
      }
    } else {
      if ($display)
        $display.innerHTML = value2;
    }
  }
  function show(show2 = true) {
    _cell.isHidden = !show2;
    $cell.classList.toggle("visible", show2);
    $cell.classList.toggle("hidden", !show2);
  }
  function showContent(show2 = true) {
    _cell.isHidden = !show2;
    Array.from($cell.children).forEach(($child) => {
      $child.classList.toggle("hidden", !show2);
    });
  }
  function checked(checked2 = true) {
    const $checkbox = $cell.querySelector(".dt-row-checkbox input");
    if ($checkbox)
      $checkbox.checked = checked2;
  }
  function disable(disabled = true) {
    _cell.isDisabled = disabled;
    Array.from($cell.children).forEach(($child) => {
      $child.classList.toggle("disabled", disabled);
    });
  }
}

// src/components/Row.js
function Row(table, options) {
  const _row = {
    element: null,
    id: utils.generateGuid(),
    cells: [],
    isSelected: false,
    isHidden: false,
    isDisabled: false,
    _data: options.data || {},
    // interno
    data,
    cell,
    index,
    show,
    disable,
    select,
    text,
    remove
  };
  const $row = create();
  _loadCells();
  return _row;
  function create() {
    const $row2 = document.createElement("div");
    $row2.id = _row.id;
    $row2.classList.add("dt-body-row");
    $row2.addEventListener("click", (event) => {
      if (!table.options.checkbox && table.options.rows.selectOnClick)
        select(true, event);
    });
    $row2.addEventListener("dblclick", (event) => {
      if (!table.options.rows.selectOnClick)
        return;
      if (window.getSelection)
        window.getSelection().removeAllRanges();
      if (table.options.onDoubleClickRow)
        table.options.onDoubleClickRow({ row: _row, event });
    });
    $row2.classList.toggle("selectable", table.options.rows.selectOnClick);
    _row.element = $row2;
    return $row2;
  }
  function _loadCells() {
    if (table.options.checkbox) {
      const options2 = new CellOptions();
      options2.row = _row;
      options2.checkbox = true;
      options2.resize = false;
      const cell2 = Cell(table, options2);
      _row.cells.push(cell2);
      $row.appendChild(cell2.element);
    }
    for (const name in table.options.columns) {
      const column = table.options.columns[name];
      const options2 = utils.mergeProps(new CellOptions(), column);
      options2.row = _row;
      options2.name = name;
      options2.data = _row._data;
      options2.value = _row._data[name];
      const cell2 = Cell(table, options2);
      _row.cells.push(cell2);
      $row.appendChild(cell2.element);
    }
  }
  function cell(nameOrIndex) {
    const cell2 = typeof nameOrIndex == "number" ? _row.cells[nameOrIndex] : _row.cells.find((cell3) => cell3.options.name == nameOrIndex);
    return cell2;
  }
  function index() {
    return utils.getElementIndex($row);
  }
  function show(show2 = true) {
    _row.isHidden = !show2;
    $row.classList.toggle("hidden", !show2);
  }
  function disable(disabled = true) {
    _row.isDisabled = disabled;
    $row.classList.toggle("disabled", disabled);
  }
  function select(selected = true, event) {
    if (event && event.shiftKey && window.getSelection)
      window.getSelection().removeAllRanges();
    if (table.options.checkbox) {
      _row.isSelected = selected;
      if (table.options.onSelectRows)
        table.options.onSelectRows({ rows: table.selectedRows() });
    } else {
      if (!table.options.rows.allowMultipleSelection || !event || !event.ctrlKey && !event.shiftKey) {
        table.unselectRows(event, false);
        table._lastRowSelected = null;
      }
      if (event && event.ctrlKey) {
        selected = !_row.isSelected;
      }
      if (event && event.shiftKey && table._lastRowSelected) {
        let indexes = utils.createRangeArray(utils.getElementIndex(table._lastRowSelected), utils.getElementIndex($row));
        table.selectRows(indexes);
      }
      _row.isSelected = selected;
      if (!event || !event.shiftKey)
        table._lastRowSelected = $row;
      $row.classList.toggle("selected", selected);
      if (table.options.onSelectRows)
        table.options.onSelectRows({ rows: table.selectedRows() });
    }
  }
  function data(fields, meta = false) {
    if (fields) {
      for (const name in fields) {
        let value = fields[name];
        let cell2 = _row.cell(name);
        cell2.value(value);
      }
      if (table.options.onUpdateRow)
        table.options.onUpdateRow({ row: _row, fields });
    } else {
      if (!meta)
        return (({ meta: meta2, ...data2 }) => data2)(_row._data);
      return _row._data;
    }
  }
  function text(fieldNames) {
    let cells = fieldNames ? _row.cells.filter((x) => !!fieldNames.find((name) => name == x.options.name)) : _row.cells;
    let text2 = [];
    cells.forEach(
      (cell2) => text2.push(cell2.element.querySelector(".value-display").innerText.trim())
    );
    return text2;
  }
  function remove() {
    table.removeRows(_row);
  }
}

// src/components/Footer.js
function Footer(table) {
  const $footer = create();
  const _footer = {
    element: $footer,
    isHidden: table.options.footer.hidden,
    isDisabled: table.options.footer.disabled,
    show,
    disable,
    content
  };
  content(table.options.footer.content);
  show(!_footer.isHidden);
  disable(_footer.isDisabled);
  return _footer;
  function create() {
    const $footer2 = document.createElement("div");
    $footer2.classList.add("dt-footer");
    return $footer2;
  }
  function content(content2) {
    if (!content2) return;
    if (typeof content2 == "string") {
      $footer.innerHTML = content2;
    } else if (content2 instanceof HTMLElement) {
      $footer.appendChild(content2);
    }
  }
  function show(show2 = true) {
    _footer.isHidden = !show2;
    $footer.classList.toggle("hidden", !show2);
  }
  function disable(disabled = true) {
    _footer.isDisabled = disabled;
    $footer.classList.toggle("disabled", disabled);
  }
}

// src/components/Table.js
function Table(options) {
  const _table = {
    options,
    id: options.id ? "dt-" + options.id : utils.generateGuid(),
    element: null,
    elements: {
      scrollable: null
    },
    header: null,
    body: {
      element: null
    },
    _columnWidths: null,
    rows: [],
    _lastRowSelected: null,
    footer: null,
    isDisabled: false,
    _data: options.data || [],
    data,
    append,
    load,
    reload,
    width,
    height,
    column,
    addRow,
    selectedRows,
    selectRows,
    unselectRows,
    rowsByFieldValue,
    moveSelectedRows,
    removeRows,
    removeSelectedRows,
    removeUnselectedRows,
    sort,
    disable,
    clear,
    export: _export,
    _setBorders
  };
  const $table = create();
  const key_storedWidths = `${_table.id}-widths`;
  createHeader();
  createBody();
  createFooter();
  width(options.width);
  height(options.height);
  disable(options.disabled);
  load(options.data);
  return _table;
  function create() {
    const $table2 = document.createElement("div");
    $table2.id = _table.id;
    $table2.classList.add("dt");
    const $scrollable = document.createElement("div");
    $scrollable.classList.add("scrollable");
    $table2.appendChild($scrollable);
    $scrollable.addEventListener("scroll", (event) => {
      let element = event.target;
      let atBottom = Math.ceil(element.scrollTop + element.clientHeight) >= element.scrollHeight - 1;
      if (atBottom && !element.alreadyAtBottom) {
        element.alreadyAtBottom = true;
        if (options.onScrollEnd)
          options.onScrollEnd({ event, end: true });
      } else if (!atBottom) {
        element.alreadyAtBottom = false;
      }
    });
    if (options.borders.table.all) {
      $table2.classList.add("table-border-all");
      if (options.borders.table.radius != null) {
        let radius = options.borders.table.radius;
        $table2.style.borderRadius = utils.parseDimension(radius);
        $scrollable.style.borderRadius = utils.parseDimension(radius);
      }
    } else {
      if (options.borders.table.top)
        $table2.classList.add("table-border-top");
      if (options.borders.table.bottom)
        $table2.classList.add("table-border-bottom");
    }
    if (options.style)
      utils.setElementStyle($table2, options.style);
    _table.element = $table2;
    _table.elements.scrollable = $scrollable;
    return $table2;
  }
  function createHeader() {
    const header = Header(_table);
    _table.header = header;
    $table.querySelector(".scrollable").appendChild(header.element);
    header.show(!options.header.hidden);
    header.disable(options.header.disabled);
  }
  function createBody() {
    const $body = document.createElement("div");
    $body.classList.add("dt-body");
    _table.body.element = $body;
    $table.querySelector(".scrollable").appendChild($body);
  }
  function createFooter() {
    if (options.footer) {
      const footer = Footer(_table);
      _table.footer = footer;
      $table.appendChild(footer.element);
    }
  }
  function column(nameOrIndex) {
    return {
      show,
      disable: disable2
    };
    function show(show2 = true) {
      _table.header.cell(nameOrIndex).show(show2);
      _table.rows.forEach((row) => row.cell(nameOrIndex).show(show2));
      _setColumnWidths();
    }
    function disable2(disabled = true) {
      _table.header.cell(nameOrIndex).disable(disabled);
      _table.rows.forEach((row) => row.cell(nameOrIndex).disable(disabled));
    }
  }
  function width(width2) {
    if (width2 == void 0)
      return $table.clientWidth;
    $table.style.width = utils.parseDimension(width2) || "auto";
  }
  function height(height2) {
    if (height2 == void 0)
      return $table.clientHeight;
    $table.style.height = utils.parseDimension(height2) || "auto";
  }
  function data(data2, meta = false) {
    data2 = data2 || _table._data;
    if (data2.length) {
      for (const columnName in options.columns) {
        data2.forEach((item) => {
          if (!item.hasOwnProperty(columnName))
            item[columnName] = "";
        });
      }
    }
    _table._data = data2;
    if (!meta)
      return _table._data.map(({ meta: meta2, ...item }) => item);
    return _table._data;
  }
  function load(_data) {
    clear(!!_data);
    data(_data, true).forEach(
      (item) => addRow(item, false, false)
    );
    _setColumnWidths();
    _setColumnResizable();
    _setBorders();
    _table.elements.scrollable.scrollTop = 0;
  }
  function append(_data) {
    data([..._table._data, ..._data], true);
    _data.forEach(
      (item) => addRow(item, false, false)
    );
    _setBorders();
  }
  function reload() {
    load();
  }
  function clear(clearData = true) {
    if (clearData)
      data([]);
    _table.rows = [];
    _table.body.element.innerHTML = "";
    _table.header.cells[0].checked(false);
  }
  function addRow(data2, insert = true, setBorders = true) {
    const row = Row(_table, { data: data2 });
    _table.rows.push(row);
    _table.body.element.appendChild(row.element);
    data2.meta = {
      row: {
        id: row.id
      }
    };
    if (insert)
      _table._data.push(data2);
    if (setBorders)
      _setBorders();
    if (options.onAddRow)
      options.onAddRow({ row });
    return row;
  }
  function selectedRows() {
    return _table.rows.filter((x) => x.isSelected);
  }
  function rowsByFieldValue(fieldName, value) {
    if (fieldName == void 0 || value == void 0)
      return;
    return _table.rows.filter(
      (row) => row._data[fieldName] == value
    );
  }
  function selectRows(indexes) {
    if (indexes)
      indexes = indexes instanceof Array ? indexes : [indexes];
    _table.rows.forEach((row) => {
      let selected = false;
      if (indexes) {
        for (let i = 0; i < indexes.length; i++) {
          if (utils.getElementIndex(row.element) == indexes[i]) {
            selected = true;
            break;
          }
        }
      } else {
        selected = true;
      }
      row.isSelected = selected;
      if (options.checkbox) {
        row.cells[0].checked(selected);
      } else {
        row.element.classList.toggle("selected", selected);
      }
    });
    if (options.checkbox)
      _table.header.cells[0].checked();
    if (options.onSelectRows)
      options.onSelectRows({ rows: selectedRows() });
  }
  function unselectRows(event, callback = true) {
    _table.header.cells[0].checked(false);
    selectedRows().forEach((row) => {
      row.isSelected = false;
      row.element.classList.remove("selected");
      row.cells[0].checked(false);
    });
    if (options.onUnselectRows && callback)
      options.onUnselectRows({ event });
  }
  function moveSelectedRows(down = true) {
    if (options.sort) return;
    if (down) {
      for (let i = _table.rows.length - 1; i >= 0; i--) {
        let fromIndex = i;
        let toIndex = i + 1;
        if (_table.rows[i].isSelected) {
          if (toIndex < _table.rows.length)
            changePosition(fromIndex, toIndex);
          else
            break;
        }
      }
    } else {
      for (let i = 0; i < _table.rows.length; i++) {
        let fromIndex = i;
        let toIndex = i - 1;
        if (_table.rows[i].isSelected) {
          if (toIndex >= 0)
            changePosition(fromIndex, toIndex);
          else
            break;
        }
      }
    }
    _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
    function changePosition(fromIndex, toIndex) {
      const row = _table.rows.splice(fromIndex, 1)[0];
      const item = _table._data.splice(fromIndex, 1)[0];
      _table.rows.splice(toIndex, 0, row);
      _table._data.splice(toIndex, 0, item);
    }
  }
  function removeRows(rows) {
    rows = rows instanceof Array ? rows : [rows];
    if (!rows.length)
      return;
    rows.forEach((row) => {
      _table.rows.forEach((_row, index) => {
        if (_row.id == row.id)
          _table.rows.splice(index, 1);
      });
      _table._data.forEach((item, index) => {
        if (item.meta.row.id == row.id)
          _table._data.splice(index, 1);
      });
      row.element.remove();
    });
    if (options.onRemoveRows)
      options.onRemoveRows();
  }
  function removeSelectedRows() {
    removeRows(selectedRows());
    _table.header.cells[0].checked(false);
  }
  function removeUnselectedRows() {
    removeRows(_table.rows.filter((row) => !row.isSelected));
  }
  function sort(fieldName, ascending = true) {
    _table.rows.sort((a, b) => {
      let va = a.cell(fieldName).value();
      let vb = b.cell(fieldName).value();
      if (typeof va == "string") {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb)
        return ascending ? -1 : 1;
      if (va > vb)
        return ascending ? 1 : -1;
      return 0;
    });
    _table.rows.forEach((row) => _table.body.element.appendChild(row.element));
  }
  function disable(disabled = true) {
    _table.isDisabled = disabled;
    $table.classList.toggle("disabled", disabled);
  }
  function _export(rows, options2 = { separator: "	" }) {
    let text = (rows || _table.selectedRows()).map((row) => {
      let fieldNames = row.cells.filter((x) => !x.checkbox && !x.isHidden).map((x) => x.options.name);
      return row.text(fieldNames).join(options2.separator);
    }).join("\n");
    return text;
  }
  function _setColumnWidths() {
    let widths = _storedWidths() || _table._columnWidths;
    if (!widths) {
      widths = [];
      if (options.checkbox)
        widths.push("34px");
      for (let name in options.columns) {
        let column2 = options.columns[name];
        if (column2.hidden)
          continue;
        let width2 = column2.width;
        let minWidth = column2.minWidth;
        let minMaxWidth;
        if (!width2 && !minWidth) {
          minMaxWidth = "1fr";
        } else if (width2 == minWidth) {
          minMaxWidth = width2 + "px";
        } else {
          width2 = width2 ? width2 + "px" : "1fr";
          minWidth = minWidth ? minWidth + "px" : width2;
          minMaxWidth = `minmax(${minWidth}, ${width2})`;
        }
        widths.push(minMaxWidth);
      }
    }
    _table._columnWidths = widths;
    _table.header.element.style.gridTemplateColumns = widths.join(" ");
    _table.body.element.style.gridTemplateColumns = widths.join(" ");
  }
  function _setColumnResizable() {
    const $header = _table.header.element;
    const $headerCells = $header.querySelectorAll(".dt-header-cell:not(.hidden)");
    const $body = _table.body.element;
    let currentColumn = null;
    let currentColumnIndex;
    let columnWidths;
    let startX;
    let startWidth;
    let diff;
    let isResizing = false;
    if ($header.hasResizeHandler)
      return;
    $headerCells.forEach(($cell, index) => {
      const $resizer = $cell.querySelector(".resizer");
      if ($resizer) {
        $resizer.addEventListener("mousedown", (event) => startResize(event, index, $cell));
        $resizer.addEventListener("click", (event) => event.stopPropagation());
      }
    });
    $header.hasResizeHandler = true;
    function startResize(event, index, $column) {
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
      currentColumn = _table.header.cell($column.dataset.name);
      if (!options.resize && !currentColumn.options.resize)
        return;
      $header.classList.add("resizing");
      isResizing = true;
      currentColumnIndex = index;
      startX = event.pageX;
      columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
      startWidth = parseFloat(columnWidths[currentColumnIndex]);
      document.body.style.cursor = "e-resize";
      document.body.style.userSelect = "none";
    }
    function resize(e) {
      if (!isResizing) return;
      diff = e.pageX - startX;
      let minWidth = currentColumn.options.minWidth || 50;
      let width2 = Math.max(minWidth, startWidth + diff);
      setColumnWidth(currentColumnIndex, width2);
    }
    function setColumnWidth(columnIndex, width2) {
      width2 = typeof width2 == "number" ? width2 + "px" : width2;
      columnWidths = getComputedStyle($header).gridTemplateColumns.split(" ");
      columnWidths[columnIndex] = width2;
      $header.style.gridTemplateColumns = columnWidths.join(" ");
      $body.style.gridTemplateColumns = columnWidths.join(" ");
      _table._columnWidths = columnWidths;
    }
    function stopResize() {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
      if (!isResizing)
        return;
      isResizing = false;
      $header.classList.remove("resizing");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      _storedWidths(_table._columnWidths);
      if (diff && options.onResizeColumn) {
        options.onResizeColumn({ column: currentColumn, widths: _table._columnWidths });
        diff = 0;
      }
    }
  }
  function _storedWidths(widths) {
    if (widths) {
      widths[widths.length - 1] = `minmax(${widths[widths.length - 1]}, 1fr)`;
      localStorage.setItem(key_storedWidths, JSON.stringify(widths));
    } else {
      widths = localStorage.getItem(key_storedWidths);
      if (widths)
        _table._columnWidths = JSON.parse(widths);
      return _table._columnWidths;
    }
  }
  function _setBorders() {
    if (!(data().length && _table.header && _table.body)) return;
    _table.header.element.querySelector(".visible:last-child").classList.remove("cell-border-right");
    _table.body.element.childNodes.forEach(($row, index) => {
      $row.querySelector(".visible:last-child").classList.remove("cell-border-right");
    });
    let radius = options.footer.hidden ? "inherit" : "0px";
    _table.elements.scrollable.style.borderBottomLeftRadius = radius;
    _table.elements.scrollable.style.borderbottomRightRadius = radius;
  }
}

// src/index.js
function DataTable(options) {
  options = utils.mergeProps(new TableOptions(), options);
  const _table = Table(options);
  if (options.place)
    options.place.appendChild(_table.element);
  window.addEventListener("click", onWindowClick);
  window.addEventListener("keydown", onKeyDown);
  _table.destroy = destroy;
  return _table;
  function onWindowClick(event) {
    if (_table.isDisabled)
      return;
    if (!event.target.closest(".dt-header") && !event.target.closest(".dt-body")) {
      if (options.onClickOut)
        options.onClickOut({ event });
      if (!options.checkbox && !event.cancelUnselectRows)
        _table.unselectRows(event);
    }
  }
  function onKeyDown(event) {
    if (event.ctrlKey && event.key == "a" && (options.rows.selectOnClick && options.rows.allowMultipleSelection || options.checkbox)) {
      event.preventDefault();
      _table.selectRows();
    }
    if (options.onCopyClip && event.ctrlKey && event.key == "c" && (options.rows.selectOnClick || options.checkbox)) {
      options.onCopyClip({ text: _table.export() });
    }
    if (event.key == "Escape")
      _table.unselectRows(event);
  }
  function destroy() {
    window.removeEventListener("click", onWindowClick);
    window.removeEventListener("keydown", onKeyDown);
    _table.element.remove();
  }
}
export {
  DataTable
};
