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
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }
`

const Container = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(1, minmax(100px, 1fr));
  grid-gap: 0px;
  background: none;
  border-radius: 0;
  cursor: pointer;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.05);
  will-change: width, height;
  overflow-y: scroll;
`

const Item = styled(animated.div)`
  width: 100%;
  height: 85px;
  will-change: transform, opacity;
  color: #ffffff;
  box-shadow: inset 0 2px 2px rgba(0, 0, 0, .5);
  border-bottom: solid 2px rgba(255, 2555, 255, .05);
  position: relative;
  overflow: hidden;
`

export { Global, Container, Item }
