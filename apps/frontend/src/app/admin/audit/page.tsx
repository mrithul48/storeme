import React from "react";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.adminAuditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Platform Admin Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Immutable audit trail recording all privileged operations, plan changes, merchant status toggles, and CMS updates.
        </p>
      </div>

      <Card className="p-0 overflow-hidden bg-slate-900/60 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Admin Actor</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Details</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <Badge variant="info" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{log.entityType}</div>
                    {log.entityId && (
                      <div className="font-mono text-[10px] text-slate-500">
                        {log.entityId}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-slate-200">
                      {log.adminEmail}
                    </div>
                    <div className="text-slate-500 text-[10px] font-mono">
                      {log.adminId}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {log.ipAddress || "Internal"}
                  </td>
                  <td className="p-4 max-w-xs truncate text-slate-400 font-mono text-[11px]">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                  <td className="p-4 text-right text-slate-500 text-[11px]">
                    {formatDateTime(log.createdAt)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No administrative audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
