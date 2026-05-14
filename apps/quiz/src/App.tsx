/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Quiz } from './components/Quiz';
import { ConversionScreen } from './components/ConversionScreen';
import { CheckoutScreen } from './components/CheckoutScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'quiz' | 'conversion' | 'checkout'>('quiz');
  const [quizStartStep, setQuizStartStep] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pedido')) {
      setCurrentScreen('checkout');
    }
  }, []);

  return (
    <>
      {currentScreen === 'quiz' && (
        <Quiz 
          initialStep={quizStartStep}
          onFinishQuiz={() => setCurrentScreen('conversion')} 
        />
      )}
      {currentScreen === 'conversion' && (
        <ConversionScreen 
          onBackToQuiz={() => {
            setQuizStartStep(3);
            setCurrentScreen('quiz');
          }}
          onGoToCheckout={() => setCurrentScreen('checkout')}
        />
      )}
      {currentScreen === 'checkout' && (
        <CheckoutScreen 
          onCompleted={() => {
            alert('A música foi confirmada e está sendo processada! Você receberá no seu WhatsApp.');
            setCurrentScreen('quiz');
          }}
        />
      )}
    </>
  );
}
