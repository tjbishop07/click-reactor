import React from 'react'
import { useMonetizationState } from 'react-web-monetization'
import '../styles/monitization.scss';

const MonitizationMessage = props => {
    const monetization = useMonetizationState()
    return <p className="monitization-message">
        {monetization.state === 'pending' && 'Loading...'}
        {monetization.state === 'started' && 'Thanks for supporting our site!'}
        {!monetization.state && 'Sign up for Coil to support our site!'}
    </p>
}

export default MonitizationMessage