/** @jsx mdx */
import { mdx } from '@mdx-js/react'
import { useContext } from 'react'
import renderer from 'react-test-renderer'
import { matchers } from 'jest-emotion'
import { ThemeProvider, Context, Styled, jsx, useColorMode } from '../src/index'

expect.extend(matchers)

const renderJSON = el => renderer.create(el).toJSON()

test('renders', () => {
  const json = renderJSON(
    <ThemeProvider>
      <h1>Hello</h1>
    </ThemeProvider>
  )
  expect(json).toMatchSnapshot()
})

test('renders with styles', () => {
  const json = renderJSON(
    <ThemeProvider
      theme={{
        styles: {
          h1: {
            color: 'tomato',
          },
        },
      }}>
      <h1>Hello</h1>
    </ThemeProvider>
  )
  expect(json).toMatchSnapshot()
})

test('creates non-standard components', () => {
  const json = renderJSON(
    <ThemeProvider
      components={{
        sup: 'sup',
      }}
      theme={{
        styles: {
          sup: {
            color: 'tomato',
          },
        },
      }}>
      <sup>hey</sup>
    </ThemeProvider>
  )
  expect(json).toMatchSnapshot()
  expect(json).toHaveStyleRule('color', 'tomato')
})

test('styles React components', () => {
  const Beep = props => <h2 {...props} />
  const Inner = props => {
    const context = useContext(Context)
    return mdx(context.components.Beep, props)
  }

  const json = renderJSON(
    <ThemeProvider
      components={{
        Beep,
      }}
      theme={{
        styles: {
          Beep: {
            color: 'tomato',
          },
        },
      }}>
      <Inner />
    </ThemeProvider>
  )
  expect(json.type).toBe('h2')
  expect(json).toHaveStyleRule('color', 'tomato')
})

test('components accept an `as` prop', () => {
  const Beep = props => <h2 {...props} />
  const json = renderJSON(
    <ThemeProvider
      theme={{
        styles: {
          h1: {
            color: 'tomato',
          },
        },
      }}>
      <Styled.h1 as={Beep}>Beep boop</Styled.h1>
    </ThemeProvider>
  )
  expect(json.type).toBe('h2')
  expect(json).toHaveStyleRule('color', 'tomato')
})

test('components with `as` prop receive all props', () => {
  const Beep = props => <div {...props} />
  const json = renderJSON(<Styled.a as={Beep} activeClassName="active" />)
  expect(json.type).toBe('div')
  expect(json.props.activeClassName).toBe('active')
})

test('custom pragma adds styles', () => {
  const json = renderJSON(
    jsx('div', {
      sx: {
        mx: 'auto',
        p: 2,
        bg: 'tomato',
      },
    })
  )
  expect(json).toHaveStyleRule('margin-left', 'auto')
  expect(json).toHaveStyleRule('margin-right', 'auto')
  expect(json).toHaveStyleRule('padding', '8px')
  expect(json).toHaveStyleRule('background-color', 'tomato')
})

test('warns when multiple versions of emotion are installed', () => {
  jest.spyOn(global.console, 'warn')
  const json = renderJSON(
    <Context.Provider
      value={{
        emotionVersion: '9.0.0',
      }}>
      <ThemeProvider>Conflicting versions</ThemeProvider>
    </Context.Provider>
  )
  expect(console.warn).toBeCalled()
})

test('functional themes receive outer theme', () => {
  const outer = {
    colors: {
      text: 'tomato',
    },
  }
  const theme = jest.fn()
  const json = renderJSON(
    jsx(
      ThemeProvider,
      { theme: outer },
      jsx(
        ThemeProvider,
        { theme },
        jsx('div', {
          sx: {
            color: 'text',
          },
        })
      )
    )
  )
  expect(theme).toHaveBeenCalledWith(outer)
  expect(json).toHaveStyleRule('color', 'text')
})

test('functional themes can be used at the top level', () => {
  const theme = jest.fn(() => ({
    useCustomProperties: false,
    colors: {
      primary: 'tomato',
    },
  }))
  let json
  expect(() => {
    json = renderJSON(
      jsx(
        ThemeProvider,
        { theme },
        jsx(
          'div',
          {
            sx: {
              color: 'primary',
            },
          },
          'hi'
        )
      )
    )
  }).not.toThrow()
  expect(json).toHaveStyleRule('color', 'tomato')
})
