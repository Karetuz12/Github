import { Merkki } from './Logo';
import { henkilo } from '@/lib/sisalto';

export function Muotokuva() {
  return (
    <div className={henkilo.kuva ? 'muotokuva lasi' : 'muotokuva lasi tumma on-tyhja'}>
      {henkilo.kuva ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={henkilo.kuva} alt={henkilo.nimi} />
      ) : (
        <>
          <div className="muotokuva-kerrokset" />
          <span className="muotokuva-tyhja">
            <Merkki koko={96} />
          </span>
        </>
      )}
    </div>
  );
}
