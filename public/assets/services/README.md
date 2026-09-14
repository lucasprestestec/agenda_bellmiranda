# Fotos dos serviços

Uma imagem por serviço. O mapeamento `slug do serviço -> arquivo -> alt` vive
em `lib/serviceImages.js` — nenhum componente monta caminho de imagem na mão.

Os nomes de arquivo vieram dos pacotes de assets e nem sempre batem com o slug
do serviço no banco (ex.: `so-mao` usa `manicure-tradicional.webp`), por isso o
mapeamento é explícito e não derivado do slug.

Para trocar a foto de um serviço: substitua o arquivo mantendo o nome, ou
aponte o campo `file` daquele serviço para o novo arquivo.

| Slug (banco)           | Arquivo                                | Serviço                          |
| ---------------------- | -------------------------------------- | -------------------------------- |
| `alongamento-gel`      | `alongamento-em-gel.webp`               | Alongamento em gel               |
| `alongamento-fibra`    | `alongamento-com-fibra-de-vidro.webp`   | Alongamento com fibra de vidro   |
| `manutencao-gel`       | `manutencao-de-alongamento-em-gel.webp` | Manutenção de alongamento em gel |
| `manutencao-fibra`     | `manutencao-de-fibra-de-vidro.webp`     | Manutenção de fibra de vidro     |
| `banho-gel`            | `banho-de-gel.webp`                     | Banho de gel                     |
| `esmaltacao-gel-maos`  | `esmaltacao-em-gel-maos.webp`           | Esmaltação em gel — mãos         |
| `esmaltacao-gel-pes`   | `esmaltacao-em-gel-pes.webp`            | Esmaltação em gel — pés          |
| `postica-realista`     | `postica-realista.webp`                 | Postiça realista                 |
| `so-mao`               | `manicure-tradicional.webp`             | Manicure tradicional             |
| `so-pe`                | `pedicure-tradicional.webp`             | Pedicure tradicional             |
| `pe-mao-tradicional`   | `maos-pes-tradicional.webp`             | Mãos + pés tradicional           |
| `spa-pes`              | `spa-dos-pes.webp`                      | Spa dos pés                      |
| `reconstrucao-unha-pe` | `reconstrucao-de-unha-do-pe.webp`       | Reconstrução de unha do pé       |
| `design-sobrancelha`   | `design-sobrancelha.webp`               | Design de Sobrancelha            |
| `buco`                 | `depilacao-de-buco.webp`                | Depilação de Buço                |
| `depilacao-axila`      | `depilacao-de-axilas.webp`              | Depilação de Axilas              |
| `depilacao-face`       | `depilacao-facial.webp`                 | Depilação Facial                 |

Se um arquivo faltar, a UI mostra um fundo nude discreto no lugar da foto —
nunca uma imagem quebrada.
