import { animated } from 'react-spring'
import styled, { createGlobalStyle } from 'styled-components'

const Global = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    user-select: none;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const Container = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(1, minmax(100px, 1fr));
  grid-gap: 10px;
  background: none;
  border-radius: 0;
  cursor: pointer;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.05);
  will-change: width, height;
  overflow-y: scroll;
`

const Item = styled(animated.div)`
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
  padding: 5px;
  color: #ffffff;
`

export { Global, Container, Item }