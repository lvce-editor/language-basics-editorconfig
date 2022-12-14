/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideLineComment: 2,
  AfterPropertyName: 3,
  AfterPropertyNameAfterEqualSign: 4,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
  [State.InsideLineComment]: 'InsideLineComment',
}

/**
 * @enum number
 */
export const TokenType = {
  CssSelector: 1,
  Whitespace: 2,
  None: 57,
  Unknown: 881,
  NewLine: 884,
  Comment: 885,
  Query: 886,
  Text: 887,
  LanguageConstant: 11,
  Numeric: 15,
  PropertyName: 12,
  PropertyValueString: 14,
  Punctuation: 13,
  String: 188,
}

export const TokenMap = {
  [TokenType.Comment]: 'Comment',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.NewLine]: 'NewLine',
  [TokenType.None]: 'None',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.PropertyName]: 'JsonPropertyName',
  [TokenType.Query]: 'Query',
  [TokenType.Text]: 'Text',
  [TokenType.Unknown]: 'Unknown',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.PropertyValueString]: 'String',
  [TokenType.String]: 'String',
}

const RE_LANGUAGE_CONSTANT = /^(?:true|false)/
const RE_LINE_COMMENT_START = /^#/
const RE_WHITESPACE = /^ +/
const RE_CURLY_OPEN = /^\{/
const RE_CURLY_CLOSE = /^\}/
const RE_PROPERTY_NAME = /^[a-zA-Z\-\_\d\s]+\b(?=\s*\=)/
const RE_COLON = /^:/
const RE_PROPERTY_VALUE = /^[^;\}]+/
const RE_SEMICOLON = /^;/
const RE_COMMA = /^,/
const RE_ANYTHING = /^.+/s
const RE_NUMERIC = /^(([0-9]+\.?[0-9]*)|(\.[0-9]+))/
const RE_ANYTHING_UNTIL_CLOSE_BRACE = /^[^\}]+/
const RE_BLOCK_COMMENT_START = /^\/\*/
const RE_BLOCK_COMMENT_END = /^\*\//
const RE_BLOCK_COMMENT_CONTENT = /^.+?(?=\*\/|$)/s
const RE_ROUND_OPEN = /^\(/
const RE_ROUND_CLOSE = /^\)/
const RE_PSEUDO_SELECTOR_CONTENT = /^[^\)]+/
const RE_SQUARE_OPEN = /^\[/
const RE_SQUARE_CLOSE = /^\]/
const RE_ATTRIBUTE_SELECTOR_CONTENT = /^[^\]]+/
const RE_QUERY = /^@[a-z\-]+/
const RE_STAR = /^\*/
const RE_QUERY_NAME = /^[a-z\-]+/
const RE_QUERY_CONTENT = /^[^\)]+/
const RE_COMBINATOR = /^[\+\>\~]/
const RE_EQUAL_SIGN = /^\=/

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
  stack: [],
}

export const hasArrayReturn = true

/**
 * @param {string} line
 * @param {any} lineState
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_LINE_COMMENT_START))) {
          token = TokenType.Comment
          state = State.InsideLineComment
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_PROPERTY_NAME))) {
          part
          token = TokenType.PropertyName
          state = State.AfterPropertyName
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.InsideLineComment:
        if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.AfterPropertyName:
        if ((next = part.match(RE_EQUAL_SIGN))) {
          token = TokenType.Punctuation
          state = State.AfterPropertyNameAfterEqualSign
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterPropertyName
        } else {
          part
          throw new Error('no')
        }
        break
      case State.AfterPropertyNameAfterEqualSign:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterPropertyNameAfterEqualSign
        } else if ((next = part.match(RE_LANGUAGE_CONSTANT))) {
          token = TokenType.LanguageConstant
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_LINE_COMMENT_START))) {
          token = TokenType.Comment
          state = State.InsideLineComment
        } else if ((next = part.match(RE_ANYTHING))) {
          token = TokenType.PropertyValueString
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      default:
        console.log({ state, line })
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
