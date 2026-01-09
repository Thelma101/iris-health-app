'use client';
import ModalBackdrop from './ModalBackdrop';

const imgCancel01 = 'https://www.figma.com/api/mcp/asset/e97b51de-7fa7-4776-b957-44ca50739ef6';

interface PatientTestRecord {
  index: number;
  name: string;
}

interface OfficerTestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerName: string;
  testType: string;
  patients?: PatientTestRecord[];
  onPatientSelect?: (patientName: string) => void;
}

export default function OfficerTestListModal({
  isOpen,
  onClose,
  officerName,
  testType,
  patients,
  onPatientSelect,
}: Readonly<OfficerTestListModalProps>) {
  const defaultPatients: PatientTestRecord[] = [
    { index: 1, name: 'Tee George' },
    { index: 2, name: 'Green Lunar' },
    { index: 3, name: 'Kathryn Murphy' },
    { index: 4, name: 'Jerome Bell' },
    { index: 5, name: 'Adebayo Smith' },
    { index: 6, name: 'Chiamaka Johnson' },
    { index: 7, name: 'Oluwaseun Adeyemi' },
    { index: 8, name: 'Michael Tokunbo' },
    { index: 9, name: 'Opeyemi Braka' },
    { index: 10, name: 'Brooklyn Simmons' },
  ];

  const data = patients || defaultPatients;

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-start sm:justify-end pointer-events-none px-4 sm:px-0">
        <div className="bg-white w-full max-w-[411px] max-h-[90vh] sm:max-h-screen pointer-events-auto rounded-lg sm:rounded-br-lg shadow-xl mx-auto sm:mx-0">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-[48px] flex items-center justify-between px-[22px]">
            <h2 className="text-[20px] font-medium text-[#212b36] font-poppins">{officerName} Test List</h2>
            <button
              onClick={onClose}
              className="text-[#637381] hover:text-[#212b36] transition-colors"
            >
              <img src={imgCancel01} alt="Close" className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-0 overflow-y-auto max-h-[calc(100vh-48px)]">
            <div className="px-[22px] pt-[23px] space-y-[23px]">
              {/* Test Type Label */}
              <p className="text-[14px] font-regular text-[#b1b9c0] font-poppins">{testType}</p>

              {/* Patient List */}
              <div className="space-y-[17px]">
                {data.map((patient, idx) => (
                  <button
                    type="button"
                    key={patient.index}
                    onClick={() => onPatientSelect?.(patient.name)}
                    onKeyDown={(e) => e.key === 'Enter' && onPatientSelect?.(patient.name)}
                    className={`flex gap-[10px] items-center text-[14px] font-regular font-poppins cursor-pointer transition-colors hover:text-[#2c7be5] text-left w-full bg-transparent border-none p-0 ${
                      idx === 2 ? 'bg-[#f4f5f7] -mx-[22px] px-[22px] py-2' : ''
                    }`}
                  >
                    <span className="text-[#637381] w-[16px] flex-shrink-0">{patient.index}</span>
                    <span className="text-[#637381] flex-1 hover:text-[#2c7be5]">{patient.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
