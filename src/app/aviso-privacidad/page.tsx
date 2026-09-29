'use client';
import Link from 'next/link';
import { Scale, ShieldCheck, FileText, Mail } from 'lucide-react';

/*
  Aviso de Privacidad Integral + Términos de Uso del Sitio.
  Redacción conforme a la Ley Federal de Protección de Datos Personales
  en Posesión de los Particulares (LFPDPPP), su Reglamento y los
  Lineamientos del Aviso de Privacidad publicados en el DOF.
*/

const S = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-display font-bold text-carbon text-lg sm:text-xl mb-3 flex items-baseline gap-3">
      <span className="text-gold/60 font-serif">{n}.</span>{t}
    </h2>
    <div className="text-carbon/70 text-sm leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function AvisoPrivacidadPage() {
  return (
    <>
      {/* Encabezado */}
      <div className="bg-[#0A0A0A] grain pt-28 pb-10 sm:pt-36 sm:pb-14">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-px bg-gold"/>
            <span className="text-gold text-[10px] font-display font-bold tracking-[4px] uppercase">Documento legal</span>
          </div>
          <h1 className="font-serif font-bold text-white text-3xl sm:text-5xl mb-3">Aviso de Privacidad Integral</h1>
          <p className="text-white/50 text-sm">y Términos de Uso del Sitio Web · Última actualización: septiembre de 2026</p>
        </div>
      </div>

      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">

          {/* Resumen de confianza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12" data-no-fx>
            {[
              { Icon: ShieldCheck, t:'Tus datos, protegidos', d:'Conforme a la LFPDPPP' },
              { Icon: Scale, t:'Derechos ARCO', d:'Acceso, rectificación, cancelación y oposición' },
              { Icon: FileText, t:'Sin transferencias indebidas', d:'Nunca vendemos tu información' },
            ].map(x=>(
              <div key={x.t} className="bg-ivory rounded-xl p-4 border border-carbon/6 text-center">
                <x.Icon className="w-5 h-5 text-gold mx-auto mb-2"/>
                <p className="font-display font-bold text-carbon text-xs">{x.t}</p>
                <p className="text-muted text-[11px] mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>

          <S n="I" t="Identidad y domicilio del Responsable">
            <p>
              <strong className="text-carbon">Bacru Inmobiliaria</strong> (en lo sucesivo, el «Responsable»), con domicilio
              para oír y recibir notificaciones en Presas, Tezontepec de Aldama, Estado de Hidalgo, México, y correo
              electrónico de contacto <a href="mailto:ventasbacru@gmail.com" className="text-gold hover:underline">ventasbacru@gmail.com</a>,
              es responsable del tratamiento de los datos personales que usted proporcione a través del presente sitio web,
              vía telefónica, por WhatsApp o de manera presencial, en términos de la Ley Federal de Protección de Datos
              Personales en Posesión de los Particulares (la «Ley»), su Reglamento y demás normatividad aplicable.
            </p>
          </S>

          <S n="II" t="Datos personales sometidos a tratamiento">
            <p>Para las finalidades descritas en el presente Aviso, el Responsable podrá recabar las siguientes categorías de datos personales:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-carbon">Datos de identificación y contacto:</strong> nombre completo, número telefónico, correo electrónico y zona geográfica de interés.</li>
              <li><strong className="text-carbon">Datos patrimoniales básicos:</strong> rango de presupuesto, tipo de financiamiento de interés (INFONAVIT, FOVISSSTE, crédito bancario o pago de contado) y, en su caso, información general de la propiedad que desee enajenar.</li>
              <li><strong className="text-carbon">Datos de navegación:</strong> información técnica generada por el uso del sitio (tipo de dispositivo, páginas consultadas y fecha de acceso), con fines estadísticos.</li>
            </ul>
            <p>
              El Responsable <strong className="text-carbon">no recaba datos personales sensibles</strong> a través de este sitio web.
              Le solicitamos abstenerse de proporcionar datos de dicha naturaleza por los formularios aquí dispuestos.
            </p>
          </S>

          <S n="III" t="Finalidades del tratamiento">
            <p><strong className="text-carbon">Finalidades primarias</strong> (necesarias para la relación jurídica y de servicio):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Atender sus solicitudes de información sobre inmuebles en venta;</li>
              <li>Agendar y dar seguimiento a visitas a propiedades;</li>
              <li>Brindar asesoría en materia de créditos hipotecarios y esquemas de financiamiento;</li>
              <li>Realizar la valuación y promoción de inmuebles cuya venta nos sea encomendada;</li>
              <li>Dar cumplimiento a obligaciones legales, fiscales y contractuales derivadas de la intermediación inmobiliaria.</li>
            </ul>
            <p><strong className="text-carbon">Finalidades secundarias</strong> (no indispensables):</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Envío de información sobre nuevas propiedades, promociones y contenido de interés inmobiliario.</li>
            </ul>
            <p>
              Si no desea que sus datos sean tratados para las finalidades secundarias, puede manifestarlo en cualquier
              momento mediante correo electrónico dirigido a <a href="mailto:ventasbacru@gmail.com" className="text-gold hover:underline">ventasbacru@gmail.com</a>.
              La negativa para el uso de sus datos con fines secundarios no será motivo para negarle los servicios solicitados.
            </p>
          </S>

          <S n="IV" t="Transferencias de datos personales">
            <p>
              El Responsable podrá transferir sus datos personales, sin requerir su consentimiento, en los supuestos
              previstos por el artículo 37 de la Ley, incluyendo: (i) a sociedades integrantes del mismo grupo o aliados
              estratégicos del Responsable —incluida la constructora <strong className="text-carbon">Tekton Arquitectos</strong>—
              cuando resulte necesario para la prestación de los servicios solicitados; (ii) a instituciones financieras,
              notarías públicas y autoridades competentes, cuando sea necesario para la formalización de operaciones
              inmobiliarias o el cumplimiento de obligaciones legales.
            </p>
            <p>
              Fuera de dichos supuestos, sus datos personales <strong className="text-carbon">no serán vendidos, cedidos ni
              transferidos a terceros</strong> sin su consentimiento previo.
            </p>
          </S>

          <S n="V" t="Medios para ejercer los derechos ARCO">
            <p>
              Usted o su representante legal podrán ejercer en cualquier momento los derechos de
              <strong className="text-carbon"> Acceso, Rectificación, Cancelación y Oposición</strong> (derechos «ARCO»),
              así como revocar el consentimiento otorgado para el tratamiento de sus datos, mediante solicitud dirigida a
              <a href="mailto:ventasbacru@gmail.com" className="text-gold hover:underline"> ventasbacru@gmail.com</a>, la cual deberá contener:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nombre completo del titular y medio para comunicarle la respuesta;</li>
              <li>Documentos que acrediten su identidad o la personalidad de su representante;</li>
              <li>Descripción clara y precisa de los datos respecto de los que busca ejercer alguno de los derechos ARCO;</li>
              <li>Cualquier elemento que facilite la localización de los datos personales.</li>
            </ul>
            <p>
              El Responsable comunicará la determinación adoptada en un plazo máximo de <strong className="text-carbon">20 días hábiles</strong>,
              conforme al artículo 32 de la Ley. Si la solicitud resulta procedente, se hará efectiva dentro de los 15 días
              hábiles siguientes a la fecha en que se comunique la respuesta.
            </p>
          </S>

          <S n="VI" t="Uso de cookies y tecnologías de rastreo">
            <p>
              Este sitio utiliza almacenamiento local del navegador y tecnologías similares con la única finalidad de mejorar
              la experiencia de navegación (por ejemplo, recordar que el video de introducción ya fue reproducido). Estas
              tecnologías no recaban datos que identifiquen a la persona. Usted puede deshabilitarlas desde la configuración
              de su navegador sin que ello impida la consulta del sitio.
            </p>
          </S>

          <S n="VII" t="Medidas de seguridad">
            <p>
              El Responsable ha implementado medidas de seguridad administrativas, técnicas y físicas razonables para
              proteger sus datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no
              autorizados, en términos del artículo 19 de la Ley. El acceso a la información recabada está restringido al
              personal autorizado que la requiere para el desempeño de sus funciones.
            </p>
          </S>

          <S n="VIII" t="Términos de uso del sitio web">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-carbon">Carácter informativo.</strong> La información de los inmuebles publicados
                (precios, superficies, características, disponibilidad y fotografías) tiene fines exclusivamente informativos
                y de promoción, se encuentra sujeta a cambios sin previo aviso y <strong className="text-carbon">no constituye
                oferta vinculante</strong> en términos del Código Civil Federal. Las condiciones definitivas de cada operación
                serán las que consten en los contratos que en su caso se celebren.
              </li>
              <li>
                <strong className="text-carbon">Propiedad intelectual.</strong> El contenido de este sitio —incluyendo textos,
                fotografías, marcas, logotipos, diseño y desarrollos— es propiedad del Responsable o se utiliza con
                autorización de sus titulares. Queda prohibida su reproducción total o parcial sin consentimiento previo y
                por escrito.
              </li>
              <li>
                <strong className="text-carbon">Limitación de responsabilidad.</strong> El Responsable no será responsable por
                interrupciones del servicio, errores tipográficos, ni por el uso que terceros den a la información publicada.
                Los enlaces a sitios de terceros (incluido WhatsApp y Google Maps) se rigen por los términos y avisos de
                privacidad de dichos terceros.
              </li>
              <li>
                <strong className="text-carbon">Conducta del usuario.</strong> Queda prohibido utilizar los formularios de este
                sitio para enviar información falsa, difamatoria o con fines distintos a la contratación de servicios
                inmobiliarios. El Responsable se reserva el derecho de restringir el acceso a quien haga mal uso del sitio.
              </li>
            </ul>
          </S>

          <S n="IX" t="Modificaciones al presente Aviso">
            <p>
              El Responsable se reserva el derecho de efectuar en cualquier momento modificaciones o actualizaciones al
              presente Aviso de Privacidad. Dichas modificaciones estarán disponibles en esta misma página, indicando la
              fecha de última actualización. El uso continuado del sitio con posterioridad a la publicación de cambios
              constituirá aceptación de los mismos.
            </p>
          </S>

          <S n="X" t="Autoridad competente">
            <p>
              Si usted considera que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante la
              autoridad garante competente en materia de protección de datos personales en México
              (<a href="https://www.gob.mx" target="_blank" rel="noreferrer" className="text-gold hover:underline">www.gob.mx</a>).
              Para la interpretación y cumplimiento del presente documento, las partes se someten a la legislación y
              tribunales competentes del Estado de Hidalgo, renunciando a cualquier otro fuero que pudiera corresponderles.
            </p>
          </S>

          {/* Contacto */}
          <div className="bg-[#0A0A0A] grain rounded-2xl p-6 sm:p-8 text-center mt-4">
            <Mail className="w-6 h-6 text-gold mx-auto mb-3"/>
            <p className="font-display font-bold text-white text-base mb-1">¿Dudas sobre el tratamiento de tus datos?</p>
            <p className="text-white/50 text-sm mb-4">Escríbenos y te respondemos conforme a los plazos de ley.</p>
            <a href="mailto:ventasbacru@gmail.com"
              className="inline-block gold-gradient text-black font-display font-bold text-xs uppercase tracking-[2px] px-7 py-3.5 rounded-full">
              ventasbacru@gmail.com
            </a>
            <p className="mt-5 text-white/30 text-xs">
              <Link href="/" className="hover:text-gold transition-colors">← Volver al inicio</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
