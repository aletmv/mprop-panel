import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PanelShell, Topbar } from './PanelShell';
import { StatusBadge } from './StatusBadge';
import { ChevronLeft, ChevronRight, FileText, Phone, Mail, CheckCircle2, FolderOpen } from 'lucide-react';
import { operaciones as MOCK_OPERACIONES, estadoLabel } from './mockData';
import { buildNotaryOperaciones } from './operacionesAdapter';
import { buildPartesFromOperaciones, findParteById, ROL_LABEL, whatsappLinkFromTelefono } from './partesData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useApp } from '@/context/AppContext';

const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-slate-500">{children}</div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const DOCS_PLACEHOLDER = ['DNI', 'Constancia de CUIT/CUIL', 'Comprobante de domicilio'];

const PartesDetail = () => {
  const { id } = useParams();
  const ctx = useApp();
  const { notarySession } = ctx;
  const operaciones = buildNotaryOperaciones(ctx, MOCK_OPERACIONES);
  const partes = useMemo(() => buildPartesFromOperaciones(operaciones), [operaciones]);
  const parte = findParteById(partes, id);
  const whatsappLink = whatsappLinkFromTelefono(parte?.telefono);

  if (!notarySession) return <Navigate to="/escribanos" replace />;

  return (
    <PanelShell>
      <Topbar title="Ficha de parte" subtitle="Datos personales, documentación y legajos asociados" />

      <div className="px-9 py-6 lg:py-8 space-y-5" data-testid="parte-detail">
        <Link
          to="/escribanos/partes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          data-testid="back-to-partes-link"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          Partes
        </Link>

        {!parte ? (
          <Card className="p-10 text-center" data-testid="parte-not-found">
            <div className="text-[14px] font-semibold text-slate-900">No encontramos esta parte</div>
            <div className="text-[12.5px] text-slate-500 mt-1">
              El contacto pudo haber sido removido o el enlace ya no es válido.
            </div>
          </Card>
        ) : (
          <>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-700 grid place-items-center text-sm font-semibold shrink-0">
                  {parte.avatar || '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-slate-900 truncate">{parte.nombre}</h1>
                  <div className="text-sm text-slate-500 mt-0.5">{ROL_LABEL[parte.rolPrincipal]}</div>
                </div>
                {parte.verificado ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Verificado
                  </span>
                ) : (
                  <span className="text-[12px] text-slate-400 shrink-0">Sin verificar</span>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-5 space-y-5">
                <Card className="p-5">
                  <SectionLabel>Datos personales</SectionLabel>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="text-[11px] text-slate-500">DNI</div>
                      <div className="text-sm font-medium text-slate-900 font-mono mt-0.5">{parte.dni || '—'}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionLabel>Datos de contacto</SectionLabel>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      <span className={parte.email ? 'text-slate-900' : 'text-slate-400'}>
                        {parte.email || 'No cargado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                      <span className={parte.telefono ? 'text-slate-900' : 'text-slate-400'}>
                        {parte.telefono || 'No cargado'}
                      </span>
                      {whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir WhatsApp"
                          aria-label="Abrir WhatsApp"
                          data-testid="parte-whatsapp"
                          className="inline-flex text-[#25D366] hover:opacity-80 transition-opacity"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <span
                          title="WhatsApp no cargado"
                          aria-label="WhatsApp no cargado"
                          data-testid="parte-whatsapp"
                          className="inline-flex text-slate-300"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionLabel>Documentación personal</SectionLabel>
                  <div className="mt-3 divide-y divide-slate-100">
                    {DOCS_PLACEHOLDER.map((doc) => (
                      <div key={doc} className="flex items-center gap-2.5 py-2 text-sm" data-testid={`parte-doc-${doc}`}>
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.5} />
                        <span className="flex-1 text-slate-700">{doc}</span>
                        <span className="text-[11px] text-slate-400">No cargado</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <SectionLabel>Notas y actividad</SectionLabel>
                  <div className="mt-3 text-[12.5px] text-slate-400 text-center py-4" data-testid="parte-notas-empty">
                    Sin notas registradas todavía.
                  </div>
                </Card>
              </div>

              <div className="col-span-12 lg:col-span-7">
                <Card>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Legajos asociados</h2>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                      <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {parte.legajosCount}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {parte.legajos.map((l) => {
                      const e = estadoLabel[l.estado];
                      return (
                        <Link
                          key={`${l.opId}-${l.rol}`}
                          to={`/escribanos/operaciones/${l.opId}`}
                          className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                          data-testid={`parte-legajo-${l.opId}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-[12px] text-slate-500">{l.opId}</div>
                            <div className="text-sm font-medium text-slate-900 truncate">{l.direccion}</div>
                            <div className="text-[11.5px] text-slate-500 mt-0.5">Rol: {ROL_LABEL[l.rol]}</div>
                          </div>
                          {e && <StatusBadge variant={e.color}>{e.label}</StatusBadge>}
                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" strokeWidth={1.5} />
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </PanelShell>
  );
};

export default PartesDetail;
