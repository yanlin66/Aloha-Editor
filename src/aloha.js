/** Aloha Editor | Version 1.0 | github.com/alohaeditor */
define([
	'api',
	'dom',
	'links',
	'blocks',
	'dragdrop',
	'editables',
	'autoformat',
	'boundaries',
	'events',
	'functions',
	'keys',
	'maps',
	'mouse',
	'paste',
	'selections',
	'typing'
], function (
	Api,
	Dom,
	Links,
	Blocks,
	DragDrop,
	Editables,
	AutoFormat,
	Boundaries,
	Events,
	Fn,
	Keys,
	Maps,
	Mouse,
	Paste,
	Selections,
	Typing
) {
	'use strict';

	var doc = document;
	var win = Dom.documentWindow(doc);

	function getBoundaries(editor, nativeEvent) {
		var target = nativeEvent.target;
		var doc = target.document || target.ownerDocument;
		if ('mousedown' === nativeEvent.type) {
			// Because otherwise, if, if we are in the process of a click, and
			// the user's cursor is over the caret element,
			// Boundaries.fromPosition() will compute the boundaries to be
			// inside the absolutely positioned caret element
			Dom.setStyle(editor.selection.caret, 'display', 'none');
		}
		if ('mousedown' === nativeEvent.type || 'click' === nativeEvent.type) {
			return Boundaries.fromPosition(
				nativeEvent.clientX,
				nativeEvent.clientY,
				doc
			);
		}
		return Boundaries.get(doc);
	}

	/**
	 * Creates an event object that will contain all the following properties:
	 *		type
	 *		target
	 *		editor
	 *		editable
	 *		boundaries
	 *		nativeEvent
	 *
	 * @param  {!Editor} editor
	 * @param  {!Event}  nativeEvent
	 * @return {?Event}
	 */
	function createEvent(editor, nativeEvent) {
		if (!nativeEvent) {
			return null;
		}
		if ('mousemove' === nativeEvent.type) {
			// Because we want to move the caret out of the way when the user
			// starts creating an expanded selection by dragging.  We know that
			// we are starting an expanded selection when a mousemove
			// immediately follows a mousedown
			if ('mousedown' === editor.selection.event) {
				Dom.setStyle(editor.selection.caret, 'display', 'none');
			}
			return null;
		}
		if ('dblclick' === editor.selection.event) {
			Dom.setStyle(editor.selection.caret, 'display', 'none');
		}
		var boundaries = getBoundaries(editor, nativeEvent);
		if (!boundaries) {
			return null;
		}
		var cac = Boundaries.commonContainer(boundaries[0], boundaries[1]);
		if (!Dom.isEditableNode(cac)) {
			// Because if we are partly inside of an editable, we don't want the
			// back-button to unload the page
			if ('keydown' === nativeEvent.type) {
				if (Dom.isEditableNode(Boundaries.container(boundaries[0]))
				 || Dom.isEditableNode(Boundaries.container(boundaries[1]))) {
					Events.preventDefault(nativeEvent);
				}
			}
			return null;
		}
		var editable = Editables.fromBoundary(editor, boundaries[0]);
		if (!editable) {
			return null;
		}
		return {
			type        : nativeEvent.type,
			target      : nativeEvent.target,
			editor      : editor,
			editable    : editable,
			boundaries  : boundaries,
			nativeEvent : nativeEvent
		};
	}

	function editor(nativeEvent) {
		var event = createEvent(editor, nativeEvent);
		if (event) {
			event = Fn.comp.apply(editor.stack, editor.stack)(event);
			Selections.update(event);
		}
	}

	editor.BLOCK_CLASS = 'aloha-block';
	editor.CARET_CLASS = 'aloha-caret';
	editor.selection = Selections.Context(doc);
	editor.dnd = DragDrop.Context();
	editor.editables = {};
	editor.stack = [
		Selections.handleSelections,
		Links.handleLinks,
		Typing.handleTyping,
		AutoFormat.handleAutoFormat,
		Blocks.handleBlocks,
		DragDrop.handleDragDrop,
		Paste.handlePaste,
		Keys.handleKeys,
		Mouse.handleMouse
	];

	Events.setup(doc, editor);
	Events.add(win, 'resize', editor);

	/**
	 * The Aloha Editor namespace root.
	 *
	 * Also serves as short aloha.aloha.
	 *
	 * @param  {!Element} element
	 * @parma  {Object=}  options
	 * @return {Editable}
	 */
	function aloha(element, options) {
		return Editables.create(editor, element, options);
	}

	/**
	 * Destroys an editable.
	 *
	 * @param {!Element} element
	 * @return {Editable}
	 */
	function mahalo(element) {
		return Editables.destroy(editor, element);
	}

	Api['aloha'] = aloha;
	Api['mahalo'] = mahalo;
	Api['editor'] = editor;
	Api['buildcommit'] = '%buildcommit%';

	win['aloha'] = aloha = Maps.extend(aloha, Api);

	var egg = '%c'
	        + '       _       _                      _ _ _\n'
	        + '  __ _| | ___ | |__   __ _    ___  __| (_) |_ ___  _ __\n'
	        + ' / _` | |/ _ \\| \'_ \\ / _` |  / _ \\/ _` | | __/ _ \\| \'__|\n'
	        + '| (_| | | (_) | | | | (_| | |  __/ (_| | | || (_) | |\n'
	        + ' \\__,_|_|\\___/|_| |_|\\__,_|  \\___|\\__,_|_|\\__\\___/|_|.org\n'
	        + '\n'
	        + '%c'
	        + ' Aloha! '
	        + '\n'
	        + ' Help us shape the future of content editing on the web! '
	        + '\n'
	        + ' Join the team at %c http://github.com/alohaeditor ♥ ';

	console.log(
		egg,
		'color: #09d;',
		'font-size: 14px; background: #09d; color: #fff; padding: 0.5em 0; line-height: 2em;',
		'font-size: 14px; background: #fe7; color: #111; padding: 0.5em 0; line-height: 2em;'
	);

	return aloha;
});
