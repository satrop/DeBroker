import { supabase } from './supabaseClient'

function toRow(broker, userId) {
  return {
    id: broker.id,
    user_id: userId,
    name: broker.name,
    opt_out_url: broker.optOutUrl,
    method: broker.method,
    notes: broker.notes,
    found_on_search: broker.foundOnSearch,
    status: broker.status,
    last_submitted_date: broker.lastSubmittedDate,
    next_recheck_date: broker.nextRecheckDate,
    history: broker.history,
    updated_at: new Date().toISOString(),
  }
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    optOutUrl: row.opt_out_url,
    method: row.method,
    notes: row.notes ?? '',
    foundOnSearch: row.found_on_search,
    status: row.status,
    lastSubmittedDate: row.last_submitted_date,
    nextRecheckDate: row.next_recheck_date,
    history: row.history ?? [],
  }
}

export async function fetchRemoteBrokers(userId) {
  const { data, error } = await supabase.from('brokers').select('*').eq('user_id', userId)
  if (error) throw error
  return data.map(fromRow)
}

export async function upsertRemoteBroker(userId, broker) {
  const { error } = await supabase.from('brokers').upsert(toRow(broker, userId))
  if (error) throw error
}

export async function deleteRemoteBroker(userId, id) {
  const { error } = await supabase.from('brokers').delete().eq('user_id', userId).eq('id', id)
  if (error) throw error
}

export async function replaceAllRemoteBrokers(userId, brokers) {
  const { error: deleteError } = await supabase.from('brokers').delete().eq('user_id', userId)
  if (deleteError) throw deleteError
  if (brokers.length === 0) return
  const { error: insertError } = await supabase.from('brokers').insert(brokers.map((b) => toRow(b, userId)))
  if (insertError) throw insertError
}
