/** Mostrado enquanto o santo e as leituras carregam (não bloqueia o resto da página). */
export default function LiturgiaSkeleton({ altura = 150 }: { altura?: number }) {
    return <div className="ig-skel" style={{ height: altura }} aria-hidden="true" />;
}
