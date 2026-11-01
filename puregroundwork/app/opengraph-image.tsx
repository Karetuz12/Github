import { ogKoko, ogKuva } from '@/lib/og';

export const alt = 'PureGroundwork – markkinoinnin perusta kuntoon';
export const size = ogKoko;
export const contentType = 'image/png';

export default function Kuva() {
  return ogKuva({
    ylaotsikko: 'Markkinointi · Verkkosivut · Meta & Google',
    otsikko: 'Puhdasta pohjatyötä markkinoinnille.',
    alarivi: '+1000 projektia · +5 M€ mediabudjettia · +50 M€ mitattua myyntiä',
  });
}
