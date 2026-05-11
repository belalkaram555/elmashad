const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../pages/gaming/PlayStation.tsx'),
  path.join(__dirname, '../pages/gaming/Billiard.tsx')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add History icon to import from lucide-react
  if (!content.includes('History')) {
    content = content.replace(/Edit3\n\} from 'lucide-react';/, "Edit3, History\n} from 'lucide-react';");
  }

  const isPlayStation = file.includes('PlayStation');
  const typeKey = isPlayStation ? 'playstation' : 'billiard';

  // Add GAMING_EDITS_KEY and related functions
  if (!content.includes('GAMING_EDITS_KEY')) {
    const editLogic = `
const GAMING_EDITS_KEY = 'elmashad-gaming-invoice-edits';

interface GamingEditLog {
  id: string;
  sessionId: string;
  deviceName: string;
  deviceType: string;
  editedBy: string;
  editedByRole: string;
  editedAt: string;
  changesSummary: string;
}

const readGamingEdits = (): GamingEditLog[] => {
  try {
    const raw = localStorage.getItem(GAMING_EDITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGamingEdits = (logs: GamingEditLog[]) => {
  localStorage.setItem(GAMING_EDITS_KEY, JSON.stringify(logs.slice(0, 500)));
};
`;
    // Insert before the component declaration
    content = content.replace(`const ${isPlayStation ? 'PlayStation' : 'Billiard'}: React.FC = () => {`, editLogic + `\nconst ${isPlayStation ? 'PlayStation' : 'Billiard'}: React.FC = () => {`);
  }

  // Add State variables
  if (!content.includes('editInvoiceDuration')) {
    content = content.replace(
      /const \[editInvoiceAmount, setEditInvoiceAmount\] = useState\(''\);/,
      `const [editInvoiceAmount, setEditInvoiceAmount] = useState('');
  const [editInvoiceDuration, setEditInvoiceDuration] = useState('');
  const [showEditsModal, setShowEditsModal] = useState(false);
  const [gamingEditLogs, setGamingEditLogs] = useState<GamingEditLog[]>(() => readGamingEdits());

  const visibleGamingEditLogs = React.useMemo(() => {
    const logs = gamingEditLogs.filter(log => log.deviceType === '${typeKey}');
    if (userRole === 'cashier') {
      return logs.filter(log => log.editedBy === (user || ''));
    }
    return logs;
  }, [gamingEditLogs, userRole, user]);`
    );
  }

  // Update handleOpenEditInvoice
  content = content.replace(
    /const handleOpenEditInvoice = \(session: GamingSession\) => \{\s*setEditInvoiceSession\(session\);\s*setEditInvoiceAmount\(\(session\.totalAmount \|\| 0\)\.toString\(\)\);\s*\};/,
    `const handleOpenEditInvoice = (session: GamingSession) => {
    setEditInvoiceSession(session);
    setEditInvoiceAmount((session.totalAmount || 0).toString());
    setEditInvoiceDuration((session.durationMinutes || 0).toString());
  };`
  );

  // Update handleSaveInvoice
  const saveInvoiceRegex = /const handleSaveInvoice = \(\) => \{[\s\S]*?setEditInvoiceSession\(null\);\s*\};/;
  const newSaveInvoice = `const handleSaveInvoice = () => {
    if (!editInvoiceSession) return;
    const amount = Math.max(0, parseFloat(editInvoiceAmount) || 0);
    const duration = Math.max(0, parseInt(editInvoiceDuration) || 0);

    const changed: string[] = [];
    if (amount !== editInvoiceSession.totalAmount) changed.push(\`الإجمالي: \${editInvoiceSession.totalAmount} -> \${amount}\`);
    if (duration !== editInvoiceSession.durationMinutes) changed.push(\`المدة: \${editInvoiceSession.durationMinutes || 0} دقيقة -> \${duration} دقيقة\`);

    const updatedSession = { ...editInvoiceSession, totalAmount: amount, durationMinutes: duration };
    setGamingSessions(prev => prev.map(s => s.id === editInvoiceSession.id ? updatedSession : s));
    updateOrder(\`GAME-\${editInvoiceSession.id}\`, {
      subtotal: amount,
      total: amount,
      amountReceived: amount,
      items: (orders.find(o => o.id === \`GAME-\${editInvoiceSession.id}\`)?.items || []).map(item => ({
        ...item,
        nameAr: \`جلسة \${editInvoiceSession.deviceType === 'playstation' ? 'بلايستيشن' : 'بينج'} - \${editInvoiceSession.deviceName} (\${formatDuration(duration)})\`,
        nameEn: \`Gaming session - \${editInvoiceSession.deviceName} (\${formatDuration(duration)})\`,
        basePrice: amount,
        totalItemPrice: amount
      }))
    });
    void syncSession('update', updatedSession);

    if (changed.length > 0) {
      const newLog: GamingEditLog = {
        id: \`edit_\${Date.now()}\`,
        sessionId: editInvoiceSession.id,
        deviceName: editInvoiceSession.deviceName,
        deviceType: '${typeKey}',
        editedBy: user || 'مستخدم',
        editedByRole: userRole || 'cashier',
        editedAt: new Date().toISOString(),
        changesSummary: changed.join(' | '),
      };
      const nextLogs = [newLog, ...gamingEditLogs];
      setGamingEditLogs(nextLogs);
      writeGamingEdits(nextLogs);
    }

    addToast('تم تعديل فاتورة الجلسة', 'success');
    setEditInvoiceSession(null);
  };`;
  content = content.replace(saveInvoiceRegex, newSaveInvoice);

  // Update header buttons
  const addDeviceButtonRegex = /<Button onClick=\{\(\) => handleOpenDeviceModal\(\)\}>\s*<Plus size=\{16\} \/> إضافة .*?\s*<\/Button>/;
  const match = content.match(addDeviceButtonRegex);
  if (match && !content.includes('<History size={16} /> התعديلات')) {
    const newButtons = `<div className="flex gap-2">
          <button onClick={() => setShowEditsModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black transition-all bg-surface border-cardAccent text-secondary hover:text-textPrimary">
            <History size={16} /> التعديلات
          </button>
          ${match[0]}
        </div>`;
    content = content.replace(match[0], newButtons);
  }

  // Update Edit Invoice Modal inputs
  const editModalInputRegex = /<div>\s*<label className="text-xs font-black text-secondary uppercase block mb-1\.5">إجمالي الفاتورة \(\{currency\}\)<\/label>\s*<input[\s\S]*?onChange=\{e => setEditInvoiceAmount\(e\.target\.value\)\}\s*\/>\s*<\/div>/;
  if (content.match(editModalInputRegex) && !content.includes('إجمالي المدة (بالدقائق)')) {
    const newInputs = `<div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">إجمالي الفاتورة ({currency})</label>
              <input
                autoFocus
                type="number"
                className="w-full p-4 bg-background border border-cardAccent rounded-xl text-textPrimary font-black text-xl text-center outline-none focus:border-primary"
                value={editInvoiceAmount}
                onChange={e => setEditInvoiceAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-black text-secondary uppercase block mb-1.5">إجمالي المدة (بالدقائق)</label>
              <input
                type="number"
                className="w-full p-4 bg-background border border-cardAccent rounded-xl text-textPrimary font-black text-xl text-center outline-none focus:border-primary"
                value={editInvoiceDuration}
                onChange={e => setEditInvoiceDuration(e.target.value)}
              />
            </div>`;
    content = content.replace(editModalInputRegex, newInputs);
  }

  // Add the History Modal at the bottom
  if (!content.includes('سجل التعديلات')) {
    const historyModal = `
      {showEditsModal && (
        <Modal isOpen={showEditsModal} onClose={() => setShowEditsModal(false)}>
          <Modal.Header title="سجل التعديلات" subtitle={userRole === 'cashier' ? 'تعديلاتك فقط' : 'كل التعديلات'} />
          <Modal.Body>
            {visibleGamingEditLogs.length === 0 ? (
              <p className="text-secondary text-sm font-bold text-center">لا توجد تعديلات مسجلة</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {visibleGamingEditLogs.map(log => (
                  <div key={log.id} className="bg-background border border-cardAccent rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-textPrimary text-sm">{log.deviceName}</p>
                      <p className="text-[10px] text-secondary font-bold">{new Date(log.editedAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <p className="text-[11px] text-secondary font-bold mb-1">بواسطة: {log.editedBy} ({log.editedByRole === 'admin' ? 'مدير' : 'كاشير'})</p>
                    <p className="text-xs text-textPrimary font-bold">{log.changesSummary}</p>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth onClick={() => setShowEditsModal(false)}>إغلاق</Button>
          </Modal.Footer>
        </Modal>
      )}
`;
    // Insert right before the last closing div
    content = content.replace(/<\/div>\s*\);\s*};\s*export default/, historyModal + `    </div>\n  );\n};\n\nexport default`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
}
