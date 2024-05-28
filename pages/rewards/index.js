import { gql } from 'graphql-tag'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { getGetServerSideProps } from '@/api/ssrApollo'
import { Form, Input, SubmitButton } from '@/components/form'
import Layout from '@/components/layout'
import { useMutation, useQuery } from '@apollo/client'
import Link from 'next/link'
import { amountSchema } from '@/lib/validate'
import { numWithUnits } from '@/lib/format'
import PageLoading from '@/components/page-loading'
import { useShowModal } from '@/components/modal'
import dynamic from 'next/dynamic'
import { FAST_POLL_INTERVAL, SSR } from '@/lib/constants'
import { useToast } from '@/components/toast'
import { useLightning } from '@/components/lightning'
import { ListUsers } from '@/components/user-list'
import { Col, Row } from 'react-bootstrap'
import { proportions } from '@/lib/madness'
import { useData } from '@/components/use-data'
import { GrowthPieChartSkeleton } from '@/components/charts-skeletons'
import { useMemo } from 'react'
import { CompactLongCountdown } from '@/components/countdown'

const GrowthPieChart = dynamic(() => import('@/components/charts').then(mod => mod.GrowthPieChart), {
  loading: () => <GrowthPieChartSkeleton />
})

const REWARDS_FULL = gql`
{
  rewards {
    total
    time
    sources {
      name
      value
    }
    leaderboard {
      users {
        id
        name
        photoId
        ncomments
        nposts

        optional {
          streak
          stacked
          spent
          referrals
        }
      }
    }
  }
}
`

const REWARDS = gql`
{
  rewards {
    total
    time
    sources {
      name
      value
    }
  }
}
`

export const getServerSideProps = getGetServerSideProps({ query: REWARDS_FULL })

export function RewardLine ({ total, time }) {
  return (
    <>
      <span tyle={{ whiteSpace: 'nowrap' }}>
        {numWithUnits(total)} in rewards
      </span>
      {time &&
        <small style={{ whiteSpace: 'nowrap' }}>
          <CompactLongCountdown
            className='text-monospace'
            date={time}
          />
        </small>}
    </>
  )
}

export default function Rewards ({ ssrData }) {
  // only poll for updates to rewards and not leaderboard
  const { data: rewardsData } = useQuery(
    REWARDS,
    SSR ? {} : { pollInterval: FAST_POLL_INTERVAL, nextFetchPolicy: 'cache-and-network' })
  const { data } = useQuery(REWARDS_FULL)
  const dat = useData(data, ssrData)

  let { rewards: [{ total, sources, time, leaderboard }] } = useMemo(() => {
    return dat || { rewards: [{}] }
  }, [dat])

  if (rewardsData?.rewards?.length > 0) {
    total = rewardsData.rewards[0].total
    sources = rewardsData.rewards[0].sources
    time = rewardsData.rewards[0].time
  }

  if (!dat) return <PageLoading />

  function EstimatedReward ({ rank }) {
    return (
      <div className='text-muted fst-italic'>
        <small>
          <span>estimated reward: {numWithUnits(Math.floor(total * proportions[rank - 1]))}</span>
        </small>
      </div>
    )
  }

  return (
    <Layout footerLinks>
      <Link className='text-reset align-self-center' href='/items/141924'>
        <h4 className='pt-3 text-start text-reset' style={{ lineHeight: 1.5, textDecoration: 'underline' }}>
          rewards are sponsored by ... we are hiring
        </h4>
      </Link>
      <Row className='pb-3'>
        <Col lg={leaderboard?.users && 5}>
          <div
            className='d-flex flex-column sticky-lg-top py-5'
          >
            <h3 className='text-center text-muted'>
              <div>
                <RewardLine total={total} time={time} />
              </div>
              <Link href='/faq#how-do-i-earn-sats-on-stacker-news' className='text-info fw-normal'>
                <small><small><small>learn about rewards</small></small></small>
              </Link>
            </h3>
            <div className='my-3 w-100'>
              <GrowthPieChart data={sources} />
            </div>
            <DonateButton />
          </div>
        </Col>
        {leaderboard?.users &&
          <Col lg={7}>
            <h2 className='pt-5 text-center text-muted'>leaderboard</h2>
            <div className='d-flex justify-content-center pt-4'>
              <ListUsers users={leaderboard.users} rank Embellish={EstimatedReward} />
            </div>
          </Col>}
      </Row>
    </Layout>
  )
}

export function DonateButton () {
  const showModal = useShowModal()
  const toaster = useToast()
  const strike = useLightning()
  const [donateToRewards] = useMutation(
    gql`
      mutation donateToRewards($sats: Int!, $hash: String, $hmac: String) {
        donateToRewards(sats: $sats, hash: $hash, hmac: $hmac)
      }`)

  return (
    <>
      <Button
        onClick={() => showModal(onClose => (
          <Form
            initial={{
              amount: 10000
            }}
            schema={amountSchema}
            prepaid
            onSubmit={async ({ amount, hash, hmac }) => {
              const { error } = await donateToRewards({
                variables: {
                  sats: Number(amount),
                  hash,
                  hmac
                }
              })
              if (error) {
                console.error(error)
                toaster.danger('failed to donate')
              } else {
                const didStrike = strike()
                if (!didStrike) {
                  toaster.success('donated')
                }
              }
              onClose()
            }}
          >
            <Input
              label='amount'
              name='amount'
              type='number'
              required
              autoFocus
              append={<InputGroup.Text className='text-monospace'>sats</InputGroup.Text>}
            />
            <div className='d-flex'>
              <SubmitButton variant='success' className='ms-auto mt-1 px-4' value='TIP'>donate</SubmitButton>
            </div>
          </Form>
        ))}
        className='align-self-center'
      >DONATE TO REWARDS
      </Button>
    </>
  )
}
