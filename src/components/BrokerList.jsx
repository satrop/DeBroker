import BrokerRow from './BrokerRow'

export default function BrokerList({ brokers, actions }) {
  if (brokers.length === 0) {
    return <p className="empty-state">No brokers match the current filters.</p>
  }

  return (
    <div className="broker-list">
      {brokers.map((broker) => (
        <BrokerRow
          key={broker.id}
          broker={broker}
          onSetFoundOnSearch={actions.setFoundOnSearch}
          onSubmit={actions.submitOptOut}
          onRecheck={actions.logRecheck}
          onUpdateNotes={(id, notes) => actions.updateBroker(id, { notes })}
          onUpdateUrl={(id, optOutUrl) => actions.updateBroker(id, { optOutUrl })}
          onRemove={actions.removeBroker}
        />
      ))}
    </div>
  )
}
