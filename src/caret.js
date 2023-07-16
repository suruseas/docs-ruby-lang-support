// CaretUtil library, based on
// https://codepen.io/jeffward/pen/OJjPKYo
export const CaretUtil = {};

/**
 * Set the caret position inside a contentEditable container
 */
CaretUtil.setCaretPosition = function (container, position) {
  if (position >= 0) {
    var selection = window.getSelection();
    var range = CaretUtil.createRange(container, { count: position });
    if (range != null) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

/**
 * Get the current caret position inside a contentEditable container
 */
CaretUtil.getCaretPosition = function (container) {
  var selection = window.getSelection();
  var charCount = -1;
  var node;
  if (selection.focusNode != null) {
    if (CaretUtil.isDescendantOf(selection.focusNode, container)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;
      while (node != null) {
        if (node == container) {
          break;
        }
        if (node.previousSibling != null) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node == null) {
            break;
          }
        }
      }
    }
  }
  return charCount;
};

/**
 * Returns true if the node is a descendant (or equal to) a parent
 */
CaretUtil.isDescendantOf = function (node, parent) {
  while (node != null) {
    if (node == parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

CaretUtil.createRange = function (node, chars, range) {
  if (range == null) {
    range = window.document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }
  if (chars.count == 0) {
    range.setEnd(node, chars.count);
  } else if (node != null && chars.count > 0) {
    if (node.nodeType == 3) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      var _g = 0;
      var _g1 = node.childNodes.length;
      while (_g < _g1) {
        var lp = _g++;
        range = CaretUtil.createRange(node.childNodes[lp], chars, range);
        if (chars.count == 0) {
          break;
        }
      }
    }
  }
  return range;
};
