/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Quiz } from './components/Quiz';
import { ConversionScreen } from './components/ConversionScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { trackGA4PageView } from './lib/ga4Tracking';

type Screen = 'quiz' | 'conversion' | 'checkout';

// Detectar Safari modo privado (localStorage falha silenciosamente)
function checkLocalStorage(): boolean {
  try {
    const test = '__virahit_storage_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}


export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('quiz');
  const [quizStartStep, setQuizStartStep] = useState(1);
  const [storageWarning, setStorageWarning] = useState(false);

  // Detectar Safari modo privado ao montar
  useEffect(() => {
    if (!checkLocalStorage()) {
      setStorageWarning(true);
    }
  }, []);

  // Inicializar: ir pro checkout se URL tem ?pedido=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pedido')) {
      goToScreen('checkout', true);
    } else {
      // Garantir que o estado inicial está no history
      window.history.replaceState({ screen: 'quiz' }, '', window.location.href);
      // GA4: page_view inicial do quiz
      trackGA4PageView('/quiz');
    }
  }, []);

  // Interceptar Back/Forward do browser
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const screen = e.state?.screen as Screen | undefined;
      if (screen) {
        setCurrentScreen(screen);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToScreen = (screen: Screen, replace = false) => {
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({ screen }, '', window.location.href);
    setCurrentScreen(screen);
    // GA4 SPA page tracking — fires page_view on every screen change
    const screenPaths: Record<Screen, string> = {
      quiz: '/quiz',
      conversion: '/quiz/conversao',
      checkout: '/quiz/checkout',
    };
    trackGA4PageView(screenPaths[screen] || `/quiz/${screen}`);
  };

  return (
    <>
      {/* Aviso Safari modo privado */}
      {storageWarning && (
        <div
          role="alert"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: '#EAA115', color: '#fff', fontSize: 13, fontWeight: 700,
            padding: '10px 16px', textAlign: 'center', lineHeight: 1.4,
          }}
        >
          Você está em modo privado. Seu progresso não será salvo se fechar a página.{' '}
          <button
            onClick={() => setStorageWarning(false)}
            style={{ marginLeft: 8, background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 6, padding: '2px 8px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
          >
            OK
          </button>
        </div>
      )}

      {currentScreen === 'quiz' && (
        <Quiz
          initialStep={quizStartStep}
          onFinishQuiz={() => goToScreen('conversion')}
        />
      )}
      {currentScreen === 'conversion' && (
        <ConversionScreen
          onBackToQuiz={() => {
            setQuizStartStep(3);
            goToScreen('quiz');
          }}
          onGoToCheckout={() => goToScreen('checkout')}
        />
      )}
      {currentScreen === 'checkout' && (
        <CheckoutScreen
          onCompleted={() => {
            goToScreen('quiz');
          }}
        />
      )}
    </>
  );
}
