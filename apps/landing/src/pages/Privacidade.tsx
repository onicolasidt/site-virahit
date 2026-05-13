import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';

export default function Privacidade() {
  return (
    <div className="v2-theme antialiased overflow-x-hidden selection:bg-[var(--gold)] selection:text-white" data-mode="connect">
      <Header />
      <main className="pt-32 pb-24 px-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 abstract-pattern -z-10 rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-[var(--gold)] font-bold mb-8 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" /> Voltar para o início
            </Link>
            <span className="text-[var(--gold)] font-bold uppercase tracking-[0.4em] text-[10px] block mb-4">Documento Legal</span>
            <h1 className="text-4xl @[480px]:text-5xl text-[var(--teal)]">Política de Privacidade</h1>
          </div>

          <div className="bg-white/60 p-8 sm:p-12 border border-[var(--teal)]/5 asymmetric-border editorial-shadow">
            <div className="space-y-8 text-[var(--teal-light)] leading-relaxed text-lg font-light">
              <p className="italic border-l-2 border-[var(--gold)] pl-4"><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">1. Coleta de Informações</h2>
                <p>Coletamos informações que você nos fornece diretamente ao utilizar nossos serviços via WhatsApp, incluindo seu número de telefone, nome (se fornecido) e os áudios/textos enviados contendo seu testemunho ou história.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">2. Uso das Informações</h2>
                <p>As informações coletadas são utilizadas exclusivamente para:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Processar seu relato e gerar a música personalizada;</li>
                  <li>Comunicar-se com você sobre o status do seu pedido;</li>
                  <li>Processar pagamentos e fornecer suporte ao cliente;</li>
                  <li>Melhorar a qualidade dos nossos algoritmos de IA (de forma anonimizada).</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">3. Proteção de Dados</h2>
                <p>Seus áudios e histórias são tratados com o máximo respeito e confidencialidade. Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">4. Compartilhamento de Dados</h2>
                <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Seus dados podem ser processados por provedores de serviços terceirizados (como gateways de pagamento e APIs de Inteligência Artificial) estritamente necessários para a execução do serviço.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">5. Retenção de Dados</h2>
                <p>Manteremos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.</p>
              </div>
              
              <div>
                <h2 className="text-2xl text-[var(--teal)] mb-4">6. Seus Direitos</h2>
                <p>Você tem o direito de solicitar o acesso, correção ou exclusão dos seus dados pessoais armazenados em nossos sistemas. Para exercer esses direitos, entre em contato conosco através do nosso canal de suporte no WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
