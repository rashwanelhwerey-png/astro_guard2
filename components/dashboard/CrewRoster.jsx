"use client";

/**
 * Crew roster table. Status chips are derived live in the telemetry seed, so a
 * caution row appears without any hand-authored flag.
 */
export default function CrewRoster({ crew = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="telemetry-table">
        <thead>
          <tr>
            <th>Badge</th>
            <th>Astronaut</th>
            <th>Role</th>
            <th>Suit</th>
            <th className="text-right">SpO₂</th>
            <th className="text-right">Cardiac</th>
            <th className="text-right">EVA hrs</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {crew.map((member) => (
            <tr key={member.id}>
              <td className="readout text-neon-cyan/85">{member.id}</td>
              <td className="text-slate-100">{member.name}</td>
              <td>{member.role}</td>
              <td className="text-slate-400">{member.suit}</td>
              <td className="readout text-right">{member.o2.toFixed(1)}</td>
              <td className="readout text-right">{member.heart}</td>
              <td className="readout text-right">{member.evaHours.toFixed(1)}</td>
              <td>
                <span
                  className={`chip ${
                    member.status === "caution" ? "chip--caution" : "chip--nominal"
                  }`}
                >
                  <span className="status-dot" />
                  {member.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
