import { Header } from '../../components/site/Header';
import { Footer } from '../../components/site/Footer';
import { SITE } from '../../lib/site-config';

export const metadata = {
  title: 'Política de Privacidade — Bell Miranda',
  description:
    'Como o sistema de agendamento da Bell Miranda coleta, usa e protege seus dados, inclusive nas mensagens enviadas por WhatsApp.',
};

const UPDATED_AT = '7 de outubro de 2026';

const SECTIONS = [
  {
    title: 'Quem somos',
    body: [
      `Esta política vale para o site e o sistema de agendamento online do estúdio Bell Miranda — Nail Designer & Beauty Studio, em ${SITE.city}. O estúdio é o responsável pelo tratamento dos dados descritos aqui, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).`,
    ],
  },
  {
    title: 'Quais dados coletamos',
    body: ['Ao agendar um horário, pedimos e guardamos apenas:'],
    list: [
      'seu nome;',
      'seu número de WhatsApp;',
      'o serviço, a data e o horário escolhidos;',
      'uma observação, se você quiser escrever uma (campo opcional);',
      'se você quer ou não receber o lembrete do horário.',
    ],
    after: [
      'Também registramos o status do agendamento (confirmado, concluído ou cancelado) e quando cada mensagem automática foi enviada, para não repetir o envio.',
      'Não coletamos dados de pagamento, CPF, e-mail, endereço ou localização. Clientes não têm conta nem senha no site. O site não usa cookies de publicidade nem ferramentas de análise de visitantes; o único cookie existente serve para manter a equipe do estúdio conectada à área administrativa.',
    ],
  },
  {
    title: 'Para que usamos seus dados',
    list: [
      'reservar o horário e evitar dois atendimentos no mesmo horário;',
      'enviar a confirmação do agendamento por WhatsApp;',
      'enviar o lembrete do horário, se você marcou essa opção;',
      'avisar você caso o horário seja cancelado ou remarcado;',
      'falar com você sobre o atendimento (dúvidas, trocas, cancelamento).',
    ],
    after: [
      'Não usamos seus dados para venda, publicidade de terceiros ou perfis de consumo.',
    ],
  },
  {
    title: 'Mensagens por WhatsApp e a Meta',
    body: [
      'As mensagens automáticas (confirmação, lembrete, cancelamento e remarcação) são enviadas por WhatsApp, serviço da Meta Platforms, Inc. Elas contêm o seu nome, o serviço, a data e o horário. O envio parte de uma automação própria do estúdio, ligada ao número de WhatsApp do estúdio. O estúdio também está integrando a WhatsApp Business Platform, a API oficial da Meta, para esse mesmo fim.',
      'Ao passar pelo WhatsApp, as mensagens também ficam sujeitas à política de privacidade da Meta e do WhatsApp, que o estúdio não controla: https://www.whatsapp.com/legal/privacy-policy',
      'A profissional que fará o seu atendimento recebe uma cópia interna por WhatsApp com seu nome, telefone, serviço, data e horário, e a equipe recebe um resumo diário dos atendimentos do dia.',
    ],
  },
  {
    title: 'Onde os dados ficam e como protegemos',
    body: [
      'Os dados ficam em um banco de dados PostgreSQL em nuvem, e o site é hospedado na Vercel. Esses provedores nos prestam serviço de infraestrutura e podem manter servidores fora do Brasil. Além deles e da Meta/WhatsApp, não compartilhamos seus dados com mais ninguém.',
      'A conexão com o site usa HTTPS. A área administrativa exige senha, e as rotas de automação que entregam mensagens ao WhatsApp só respondem com uma chave secreta. Nenhum sistema é totalmente imune a falhas, mas só a equipe do estúdio acessa os agendamentos.',
      'Guardamos seus dados enquanto forem necessários para o atendimento e para o histórico do estúdio, e apagamos quando você pedir, salvo se a lei exigir que sejam mantidos.',
    ],
  },
  {
    title: 'Seus direitos',
    body: ['Pela LGPD você pode, a qualquer momento, pedir:'],
    list: [
      'confirmação de que tratamos seus dados e acesso a eles;',
      'correção de dados incompletos ou errados;',
      'anonimização, bloqueio ou exclusão dos dados;',
      'portabilidade dos dados;',
      'informação sobre com quem os dados são compartilhados;',
      'a retirada do consentimento, por exemplo para parar de receber lembretes.',
    ],
    after: [
      'Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    title: 'Fale com a gente sobre privacidade',
    body: [
      `Para qualquer pedido sobre seus dados, chame o estúdio no WhatsApp ${SITE.whatsappDisplay} ou escreva para ${SITE.email}. Para sua segurança, podemos pedir que você confirme o nome e o número usados no agendamento. Respondemos em até 15 dias.`,
    ],
  },
  {
    title: 'Mudanças nesta política',
    body: [`Se algo mudar na forma como tratamos seus dados, atualizamos esta página e a data abaixo. Última atualização: ${UPDATED_AT}.`],
  },
];

const text = { fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', lineHeight: 1.75, color: 'var(--ink-500)', margin: '0 0 14px' };

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 'var(--container-narrow)', margin: '0 auto', padding: 'clamp(120px,16vw,170px) var(--gutter) var(--section-y-tight)' }}>
        <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-serif-display)', fontWeight: 400, fontSize: 'var(--text-display-3)', color: 'var(--ink-900)' }}>
          Política de Privacidade
        </h1>
        <p style={{ ...text, marginBottom: '36px' }}>Atualizada em {UPDATED_AT}.</p>

        {SECTIONS.map((s) => (
          <section key={s.title} style={{ marginBottom: '34px' }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-serif-display)', fontWeight: 500, fontSize: 'var(--text-title)', color: 'var(--ink-900)' }}>{s.title}</h2>
            {s.body?.map((p) => <p key={p} style={text}>{p}</p>)}
            {s.list && (
              <ul style={{ ...text, paddingLeft: '22px' }}>
                {s.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
            {s.after?.map((p) => <p key={p} style={text}>{p}</p>)}
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
